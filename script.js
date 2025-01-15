document.addEventListener("DOMContentLoaded", () => {
    const ingredientsContainer = document.getElementById("ingredients-container");
    const addIngredientBtn = document.getElementById("add-ingredient-btn");
    const saveDishBtn = document.getElementById("save-dish-btn");
    const calculateBtn = document.getElementById("calculate-btn");
    const targetWeightInput = document.getElementById("target-weight");
    const dishSelector = document.getElementById("dish-selector");
    const dishNameInput = document.getElementById("dish-name");
    const scaledRecipeList = document.getElementById("scaled-recipe");

    const localStorageKey = "savedRecipes";

    // Fetch saved recipes from localStorage
    function loadSavedRecipes() {
        const savedRecipes = JSON.parse(localStorage.getItem(localStorageKey)) || {};
        updateDishSelector(savedRecipes);
        return savedRecipes;
    }

    // Update the dish dropdown with saved recipes
    function updateDishSelector(recipes) {
        dishSelector.innerHTML = '<option value="" selected>Select a dish...</option>';
        Object.keys(recipes).forEach(dishName => {
            const option = document.createElement("option");
            option.value = dishName;
            option.textContent = dishName;
            dishSelector.appendChild(option);
        });
    }

    // Parse quantity into value and unit
    function parseQuantity(quantity) {
        const match = quantity.match(/^([\d.]+)([a-zA-Z]*)$/);
        if (match) {
            return { value: parseFloat(match[1]), unit: match[2].trim() };
        }
        throw new Error(`Invalid quantity format: ${quantity}`);
    }

    // Add a new ingredient input row
    addIngredientBtn.addEventListener("click", () => {
        const ingredientRow = document.createElement("div");
        ingredientRow.classList.add("ingredient-row");
        ingredientRow.innerHTML = `
            <input type="text" placeholder="Ingredient Name" class="ingredient-name">
            <input type="text" placeholder="Quantity (e.g., 50g, 1tbsp)" class="ingredient-quantity">
        `;
        ingredientsContainer.appendChild(ingredientRow);
    });

    // Save a new dish recipe
    saveDishBtn.addEventListener("click", () => {
        const dishName = dishNameInput.value.trim();
        if (!dishName) {
            alert("Please enter a dish name.");
            return;
        }

        const ingredientRows = document.querySelectorAll(".ingredient-row");
        const recipe = {};

        ingredientRows.forEach(row => {
            const nameInput = row.querySelector(".ingredient-name");
            const quantityInput = row.querySelector(".ingredient-quantity");
            const ingredientName = nameInput.value.trim();
            const ingredientQuantity = quantityInput.value.trim();

            if (ingredientName && ingredientQuantity) {
                recipe[ingredientName] = ingredientQuantity;
            }
        });

        if (Object.keys(recipe).length === 0) {
            alert("Please add at least one ingredient.");
            return;
        }

        const savedRecipes = loadSavedRecipes();
        savedRecipes[dishName] = recipe;
        localStorage.setItem(localStorageKey, JSON.stringify(savedRecipes));
        updateDishSelector(savedRecipes);

        alert(`Recipe for "${dishName}" saved successfully.`);
        dishNameInput.value = "";
        ingredientsContainer.innerHTML = "";
    });

    // Populate ingredients when a dish is selected
    dishSelector.addEventListener("change", () => {
        const selectedDish = dishSelector.value;
        if (!selectedDish) return;

        const savedRecipes = loadSavedRecipes();
        const recipe = savedRecipes[selectedDish];
        ingredientsContainer.innerHTML = "";

        Object.keys(recipe).forEach(ingredient => {
            const ingredientRow = document.createElement("div");
            ingredientRow.classList.add("ingredient-row");
            ingredientRow.innerHTML = `
                <input type="text" value="${ingredient}" class="ingredient-name" disabled>
                <input type="text" value="${recipe[ingredient]}" class="ingredient-quantity" disabled>
            `;
            ingredientsContainer.appendChild(ingredientRow);
        });
    });

    // Calculate the scaled recipe
    calculateBtn.addEventListener("click", () => {
        const targetWeight = parseFloat(targetWeightInput.value);
        if (!targetWeight || targetWeight <= 0) {
            alert("Please enter a valid target weight.");
            return;
        }

        const baseWeight = 100; // Base recipe is for 100g
        const scalingFactor = targetWeight / baseWeight;
        const scaledRecipe = [];

        const ingredientRows = document.querySelectorAll(".ingredient-row");
        ingredientRows.forEach(row => {
            const nameInput = row.querySelector(".ingredient-name");
            const quantityInput = row.querySelector(".ingredient-quantity");

            const ingredientName = nameInput.value.trim();
            const ingredientQuantity = quantityInput.value.trim();

            if (ingredientName && ingredientQuantity) {
                try {
                    const { value, unit } = parseQuantity(ingredientQuantity);
                    const scaledValue = value * scalingFactor;
                    scaledRecipe.push(`${ingredientName}: ${scaledValue.toFixed(2)}${unit}`);
                } catch (error) {
                    alert(`Error with ingredient "${ingredientName}": ${error.message}`);
                }
            }
        });

        scaledRecipeList.innerHTML = "";
        if (scaledRecipe.length > 0) {
            scaledRecipe.forEach(item => {
                const listItem = document.createElement("li");
                listItem.textContent = item;
                scaledRecipeList.appendChild(listItem);
            });
        } else {
            scaledRecipeList.innerHTML = "<li>No ingredients to scale.</li>";
        }
    });

    // Initialize the app
    loadSavedRecipes();
});
