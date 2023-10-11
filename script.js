const factContainer = document.getElementById('fact-container');
const categoryButtons = document.querySelectorAll('.category-button');
const isDarkModeButton = document.getElementById('toggle-dark-mode-button');
let isDarkMode = false;
let filterCategory = null; // Initialize with no filter
let isLoadingFacts = false;

const facts = [];
let currentFactIndex = 0;
const factsPerPage = 10; // Number of facts to load at once

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.style.backgroundColor = isDarkMode ? 'var(--background-dark)' : 'var(--background-light)';
    factContainer.style.backgroundColor = isDarkMode ? 'var(--background-dark)' : 'var(--container-background)';
    // You can similarly update other elements' background colors, text colors, etc., as needed.
}

let abortController = new AbortController();

async function fetchRandomFact(category, retryCount = 3) {
    try {
        // Cancel any ongoing fetch when the category changes
        if (abortController.signal.aborted) {
            return { extract: '', image: null }; // Return empty data
        }

        let apiUrl = 'https://en.wikipedia.org/api/rest_v1/page/random/summary';

        const response = await fetch(apiUrl, { signal: abortController.signal });

        if (!response.ok) {
            if (response.status === 404) {
                // Handle the 404 error gracefully and continue to the next fact
                console.log('404 error encountered. Skipping to the next fact.');
                return await fetchRandomFact(category);
            } else {
                throw new Error(`API request failed with status: ${response.status}`);
            }
        }

        const data = await response.json();

        if (data && data.extract) {
            if (category && !containsInterestingKeyword(data.extract, category)) {
                console.log(`Excluded: ${data.title} (${category})`);
                // Retry fetching another fact, up to a maximum of retryCount times
                if (retryCount > 0) {
                    return await fetchRandomFact(category, retryCount - 1);
                }
            } else {
                console.log(`Included: ${data.title} (${category})`);
                return {
                    extract: data.extract,
                    image: data.thumbnail ? data.thumbnail.source : null
                };
            }
        } else {
            console.error('Invalid data received from the API:', data);
            // Retry fetching another fact, up to a maximum of retryCount times
            if (retryCount > 0) {
                return await fetchRandomFact(category, retryCount - 1);
            }
        }
    } catch (error) {
        if (!abortController.signal.aborted) {
            console.error('Error fetching data:', error);
        }
        return { extract: '', image: null }; // Return empty data
    }
}



function containsInterestingKeyword(fact, category) {
    // Modify this function to check if the fact contains keywords related to the selected category.
    const lowercasedFact = fact.toLowerCase();

    // Keywords related to the new categories: Art, Science, History, Fashion, Geography, Zodiac, and Photography.
    const categoryKeywords = {
        'Arts': [
            'painter', 'illustrator', 'sculpture', 'architect', 'novelist', 'literature', 'musician', 'singer', 'composer', 'music genre', 'concert', 'album', 'film director', 'movie industry', 'cinematic history', 'classic movie', 'film festival', 'cinematography'
        ],
        'Science': [
            'science', 'technology', 'engineering', 'mathematics',
            'biology', 'chemistry', 'physics', 'astronomy',
            'computer science', 'information technology', 'innovation', 
            'invention', 'space mission', 'astronaut', 'NASA', 'space agency', 'planet exploration', 'celestial body', 'technological innovation', 'inventor', 'visionary', 'technology breakthrough', 'scientific breakthrough', 'Nobel laureate', 'physics discovery', 'chemistry breakthrough', 'medical discovery'
        ],
        'Geography': [
            'geography', 'places', 'earth', 'bodies of water',
            'cities', 'continents', 'countries', 'deserts',
            'lakes', 'landforms', 'mountains', 'navigation',
            'oceans', 'populated places', 'village','protected areas',
            'regions', 'rivers', 'subterranea', 'territories',
            'towns', 'villages', 'famous landmark', 'historical site', 
            'architectural marvel', 'UNESCO World Heritage', 'cultural heritage',
            'natural landscape', 'geological formation', 'ecosystem', 'breathtaking view',
            'natural phenomenon', 'tourist attraction', 'local cuisine', 'cultural heritage', 'travel destination', 'must-visit place'
        ],
        'History': [    
            'Historical Events',
            'Timeline',
            'Ancient Civilizations',
            'World Wars',
            'Historical Figures',
            'Historical Documents',
            'Revolutions',
            'Dynasties',
            'Historical Artifacts',
            'Archaeology',
            'Historical Landmarks',
            'History of Science',
            'History of Medicine',
            'Industrial Revolution',
            'Renaissance'
        ]
    };

    const keywords = categoryKeywords[category];

    if (!keywords) {
        // If the selected category is not found, return true to allow all facts.
        return true;
    }

    for (const keyword of keywords) {
        if (lowercasedFact.includes(keyword)) {
            return true;
        }
    }

    return false;
}

function createFactCard(factData, isLoading = false) {
    const factElement = document.createElement('div');
    factElement.classList.add('fact-card');

    if (isLoading) {
        factElement.textContent = 'Loading...';
    } else {
        // Create a div for text content
        const textContentDiv = document.createElement('div');
        textContentDiv.textContent = factData.extract;
        textContentDiv.classList.add('fact-text'); // Add a class for styling if needed

        // Create a div for the image
        if (factData.image) {
            const imageElement = document.createElement('img');
            imageElement.src = factData.image;
            imageElement.classList.add('fact-image', 'max-image-size');
            // Append the image to the text content div
            textContentDiv.appendChild(imageElement);
        }

        // Append the text content div to the fact card
        factElement.appendChild(textContentDiv);
    }

    return factElement;
}

const homeButton = document.getElementById('home-button');

homeButton.addEventListener('click', () => {
    // Reset the filterCategory to null
    filterCategory = null;

    // Clear the factContainer
    clearFactContainer();

    // Cancel the previous API request if it's still active
    abortController.abort();

    // Create a new abort controller for the current request
    abortController = new AbortController();

    // Load initial facts (without a filter)
    loadNextFacts();

    // Debugging statement
    console.log('Navigated to Home');
});




async function loadNextFacts() {
    // Check if a request is already in progress
    if (isLoadingFacts) {
        return;
    }

    isLoadingFacts = true;

    // Display loading messages for the next facts to be fetched
    const loadingPromises = [];

    for (let i = 0; i < factsPerPage; i++) {
        try {
            console.log(`Fetching fact ${i + 1}...`); // Log the current fact number
            // Create a loading message while fetching
            const loadingFactCard = createFactCard({}, true);
            factContainer.appendChild(loadingFactCard);

            const factData = await fetchRandomFact(filterCategory);
            facts.push(factData);

            // Ensure that the loadingFactCard is still in the factContainer before removing it
            if (factContainer.contains(loadingFactCard)) {
                // Remove the loading message
                factContainer.removeChild(loadingFactCard);
                
                // Create a fact card for the fetched fact and add it to the factContainer
                const factCard = createFactCard(factData);
                factContainer.appendChild(factCard);
                console.log(`Fact ${i + 1} fetched successfully.`);
            }
        } catch (error) {
            // Handle errors, e.g., if fetching the fact fails
            console.error('Error loading fact:', error);
            console.log(`Fact ${i + 1} fetched successfully.`);
        }
    }

    isLoadingFacts = false;
}
factContainer.addEventListener('scroll', () => {
    const scrollPosition = factContainer.scrollTop;
    const containerHeight = factContainer.clientHeight;
    const contentHeight = factContainer.scrollHeight;

    // Calculate the scroll percentage (how far down the user has scrolled)
    const scrollPercentage = (scrollPosition / (contentHeight - containerHeight)) * 100;

    if (scrollPercentage >= 90) {
        loadNextFacts();
    }
});

isDarkModeButton.addEventListener('click', toggleDarkMode);

function clearFactContainer() {
    while (factContainer.firstChild) {
        factContainer.removeChild(factContainer.firstChild);
    }
}

let debounceTimer; // Add a debounce timer

categoryButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const newCategory = button.getAttribute('data-category');

        if (newCategory !== filterCategory) {
            // If a new category is selected, reset the filterCategory
            filterCategory = newCategory;
            console.log('Selected category:', filterCategory); // Debugging statement

            // Reset the currentFactIndex to 0
            currentFactIndex = 0;

            // Clear the facts array and the factContainer
            facts.length = 0;
            clearFactContainer();

            // Cancel the previous API request if it's still active after a short delay
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                abortController.abort();

                // Create a new abort controller for the current request
                abortController = new AbortController();

                // Load new facts for the selected category
                loadNextFacts();
            }, 300); // Adjust the delay as needed
        }
    });
});

// Initial load
loadNextFacts();

