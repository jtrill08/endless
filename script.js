With images but categories not organised: 
const factContainer = document.getElementById('fact-container');
const categoryNav = document.querySelector('.category-nav');
let scrolling = false;
let isDarkMode = false;
let selectedCategory = null; // Initialize with no category selected

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.style.backgroundColor = isDarkMode ? 'var(--background-dark)' : 'var(--background-light)';
    factContainer.style.backgroundColor = isDarkMode ? 'var(--background-dark)' : 'var(--container-background)';
    // You can similarly update other elements' background colors, text colors, etc., as needed.
}

async function fetchRandomFact(category) {
    try {
        let apiUrl = 'https://en.wikipedia.org/api/rest_v1/page/random/summary';

        // If a category is specified, add it to the API URL
        if (category) {
            apiUrl += `?category=${category}`;
        }

        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function containsInterestingKeyword(fact) {
    const lowercasedFact = fact.toLowerCase();
    
    for (const keyword of interestingKeywords) {
        if (lowercasedFact.includes(keyword)) {
            return true;
        }
    }
    
    return false;
}

async function displayRandomFact() {
    const factData = await fetchRandomFact();
    const factElement = document.createElement('div');
    factElement.classList.add('fact-card'); // Add class for card styling
    factElement.textContent = factData.extract;

    if (factData.thumbnail && factData.thumbnail.source) {
        const imageElement = document.createElement('img');
        imageElement.src = factData.thumbnail.source;
        imageElement.alt = 'Fact Image';
        imageElement.classList.add('fact-image'); // Add the 'fact-image' class
        factElement.appendChild(imageElement);
    }

    factContainer.appendChild(factElement);

    // Scroll to the newly added fact
    factContainer.scrollTop = factContainer.scrollHeight;
}

// Function to handle scroll events (modified)
function handleScroll(event) {
    if (scrolling) return; // If scrolling, do not display a new fact

    const scrollUp = event.deltaY < 0;
    if (!scrollUp) {
        scrolling = true;
        displayRandomFact();
        setTimeout(() => {
            scrolling = false;
        }, 1000); // Adjust the delay (in milliseconds) as needed to control the scrolling speed
    }
}

// Add wheel event listener for scrolling
window.addEventListener('wheel', handleScroll);

// Add an event listener to toggle dark mode on a button click
document.getElementById('toggle-dark-mode-button').addEventListener('click', toggleDarkMode);

// Initial loading
displayRandomFact();

