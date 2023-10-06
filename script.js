const factContainer = document.getElementById('fact-container');
const categoryNav = document.querySelector('.category-nav');
let scrolling = false;
let isDarkMode = false;
let selectedCategory = 'Art'; // Initialize with the desired category

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.style.backgroundColor = isDarkMode ? 'var(--background-dark)' : 'var(--background-light)';
    factContainer.style.backgroundColor = isDarkMode ? 'var(--background-dark)' : 'var(--container-background)';
    // You can similarly update other elements' background colors, text colors, etc., as needed.
}

async function fetchRandomFact(category) {
    try {
        let apiUrl = 'https://en.wikipedia.org/api/rest_v1/page/random/summary';

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (category && !containsInterestingKeyword(data.extract, category)) {
            // If a category is specified and the article doesn't contain the category keyword, retry.
            return fetchRandomFact(category);
        }

        return {
            extract: data.extract,
            image: data.thumbnail ? data.thumbnail.source : null
        };
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function containsInterestingKeyword(fact, category) {
    // Modify this function to check if the fact contains keywords related to art within the specified category.
    const lowercasedFact = fact.toLowerCase();

    // Keywords related to art.
    const artistKeywords = ['painter', 'artist', 'artwork', 'canvas', 'portrait'];

    for (const keyword of artistKeywords) {
        if (lowercasedFact.includes(keyword) && lowercasedFact.includes(category.toLowerCase())) {
            return true;
        }
    }

    return false;
}

async function displayRandomFact() {
    const startTime = performance.now(); // Record start time

    const factData = await fetchRandomFact(selectedCategory);

    const factElement = document.createElement('div');
    factElement.classList.add('fact-card'); // Add class for card styling
    factElement.textContent = factData.extract;

    if (factData.image) {
        const imageElement = document.createElement('img');
        imageElement.src = factData.image;
        imageElement.alt = 'Fact Image';
        imageElement.classList.add('fact-image'); // Add the 'fact-image' class
        factElement.appendChild(imageElement);
    }

    factContainer.appendChild(factElement);

    // Scroll to the newly added fact
    factContainer.scrollTop = factContainer.scrollHeight;

    const endTime = performance.now(); // Record end time
    const timeElapsed = endTime - startTime; // Calculate time elapsed
    console.log(`Time to display fact: ${timeElapsed.toFixed(2)} milliseconds`);

    // Start loading the next fact immediately
    displayRandomFact();
}

// Function to handle scroll events (modified)
function handleScroll(event) {
    if (scrolling) return; // If scrolling, do not display a new fact

    const scrollUp = event.deltaY < 0;
    if (!scrollUp) {
        scrolling = true;
        displayRandomFact();
        scrolling = false;
    }
}

// Add wheel event listener for scrolling
window.addEventListener('wheel', handleScroll);

// Add an event listener to toggle dark mode on a button click
document.getElementById('toggle-dark-mode-button').addEventListener('click', toggleDarkMode);

// Initial loading
displayRandomFact();
