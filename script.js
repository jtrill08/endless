const factContainer = document.getElementById('fact-container');
const categoryButtons = document.querySelectorAll('.category-button');
let filterCategory = null; // Initialize with no filter
let isLoadingFacts = false;

const facts = [];
let currentFactIndex = 0;
const factsPerPage = 10; // Number of facts to load at once

let abortController = new AbortController();

async function fetchRandomFact(category, retryCount = 3) {
    try {
        // Cancel any ongoing fetch when the category changes
        if (abortController.signal.aborted) {
            return { extract: '', image: null }; // Return empty data
        }

        let apiUrl = 'https://en.wikipedia.org/api/rest_v1/page/random/summary';

        const response = await fetch(apiUrl, {
            method: 'GET', // Set the HTTP method to GET
            signal: abortController.signal,
            headers: {
                'Accept-Encoding': 'gzip', // Add this header for compression
                'User-Agent': 'YourAppName/1.0 (Contact: YourContactInfo)', // Add your User-Agent header here
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                // Handle the 404 error gracefully and continue to the next fact
                console.log('404 error encountered. Skipping to the next fact.');
                return await fetchRandomFact(category);
            } else if (response.status === 429) { // Rate limit exceeded
                if (retryCount > 0) {
                    const retryDelay = Math.pow(2, 4 - retryCount) * 1000; // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    return await fetchRandomFact(category, retryCount - 1);
                } else {
                    throw new Error('Rate limit exceeded, and maximum retry count reached.');
                }
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
        'Culture': [
            'painter', 'illustrator', 'sculpture', 'architect', 'architectural style', 'architectural history', 'architectural marvels', 'architectural innovation', 
            'architectural traditions', 'novelist', 'film', 'pop culture','literature', 'musician', 'singer', 'composer',
             'music genre', 'concert', 'album', 'magazine', 'film director', 'movie industry', 
            'cinematic history', 'classic movie', 'film festival', 'cinematography', 'Renaissance art', 
            'Baroque art', 'Rococo art', 'Neoclassical art', 'Romantic art', 'Impressionism', 'Expressionism', 
            'Cubism', 'Surrealism', 'Abstract Expressionism', 'Pop Art', 'Minimalism', 'Conceptual Art', 'Bauhaus', 'Postmodernism', 'Islamic architecture', 
            'Chinese architecture', 'Indian architecture', 'Mayan architectural', 'Greek architecture', 'Roman architectural', 'Gothic architectural', 
            'Byzantine architecture', 'Japanese architecture', 'African architecture', 
            'Indigenous architecture', 'Modernist architecture', 'Art Deco architecture', 'jewels', 'art deco',
            'Mid-century modern', 'Contemporary architecture', 'classical music',
             'Architectural theory', 'Architectural criticism', 'Architectural preservation', 'vernacular architecture',
              'vernacular style', 'vernacular materials', 'vernacular design','carnaval', 'carnival' ],
        'Science': [
            'science','virus','organism', 'technology', 'engineering', 'mathematics',
            'biology', 'chemistry', 'physics', 'astronomy',
            'species', 'archaic humans','plant', 'abiotic', 'biotic', 'decomposer', 'ecosystem', 'food web', 'nutrient cycling', 'Biodiversity', 'biomimicry', 'bio-inspired', 'biophilia', 'biomimetics', 'bioengineering', 'bionics', 'bio-utilization', 'Convergent evolution', 'Cross-pollination', 'experiment', 'Biotechnology', 'Taxonomy', 'Hydroponics', 'Embryology', 'Enzyme', 'Equilibrium', 'extinction', 'Homeostasis', 'Mitosis', 'DNA', 'isotope',
            'computer science', 'information technology', 'innovation',
            'invention', 'space mission', 'astronaut', 'NASA', 'space agency', 'planet exploration', 'celestial body', 'technological innovation', 'inventor', 'visionary', 'technology breakthrough', 'scientific breakthrough', 'Nobel laureate', 'physics discovery', 'chemistry breakthrough', 'medical discovery',
            'Geology', 'Meteorology', 'Environmental Science', 'Neuroscience', 'Genetics', 'Botany', 'Zoology', 'Paleontology', 'Chemical Engineering', 'Quantum Physics', 'Astrobiology', 'Oceanography', 'Nanotechnology', 'Renewable Energy', 'Biomedical Engineering', 'Materials Science', 'Ecology', 'Climate Science', 'Cryptography', 'Particle Physics',
            'Cell Biology', 'Genomic Sequencing', 'Quantum Mechanics', 'Organic Chemistry', 'Theoretical Physics', 'Neuroplasticity', 'Molecular Biology', 'Atomic Structure', "Einstein's Theory of Relativity", 'Genetic Engineering', 'Quantum Computing', 'Evolutionary Biology', 'Chemical Reactions', 'Biomechanics', 'Particle Accelerators', 'Microbiology', 'Quantum Field Theory'],
        'Geography': [
            'geography', 'places', 'earth', 'province','bodies of water',
            'cities', 'continents', 'countries', 'deserts',
            'lakes', 'landforms', 'mountains', 'navigation',
            'oceans', 'populated places', 'village', 'protected areas',
            'regions', 'rivers', 'subterranea', 'Coastline', 'territories',
            'towns', 'villages', 'famous landmarks', 'historical sites',
            'architectural marvels', 'UNESCO World Heritage', 'cultural heritage',
            'natural landscapes', 'geological formations', 'ecosystems', 'ecoregions', 'breathtaking views',
            'natural phenomena', 'tourist attractions', 'local cuisine', 'cultural heritage', 'travel destinations', 'must-visit places', 'Amazon', 'region', 'landscapes', 'cultural treasures', 'waterfalls',
             'beaches', 'territories', 'peninsulas', 'mountains', 'plains', 'landforms', 'hills', 'gorges', 'drainage basins', 'plates', 'valleys', 
             'floodplains', 'glaciers', 'isthmuses', 'fjords', 'volcanoes', 'deserts', 'deltas',
            'physical geography', 'piers', 'wetlands', 'continents', 'bays', 'archipelagos', 
            'earthquakes', 'volcanic eruptions', 'tropical storms', 'tectonic plates', 'nutrient cycling',
             'ecotourism', 'soil erosion', 'desertification', 'permafrost', 'tundra', 'caves', 'gabions', 'levees', 
             'interlocking spurs', 'hydrographs', 'precipitation'],
        'History': [    
            'made history','Historical Event', 'Timeline', 'Ancient Civilizations', 'World Wars', 'Historical Figures', 'Historical Documents', 'Revolutions', 'Dynasties', 'Historical Artifacts', 'Archaeology', 'Historical Landmarks', 'History of Science', 'History of Medicine', 'Industrial Revolution', 'Renaissance',
            'Pharaohs', 'Pyramids', 'Nile River', 'Hieroglyphics', 'Papyrus', 'Ancient Egyptian Art',
            'Greek City-States', 'Athens', 'Sparta', 'Alexander the Great', 'Greek Mythology', 'Acropolis',
            'Julius Caesar', 'Colosseum', 'Roman Republic', 'Roman Architecture', 'Roman Law',
            'Knights', 'Crusades', 'Feudalism', 'Gothic Cathedrals', 'Viking Age',
            'Qin Dynasty', 'Han Dynasty', 'Great Wall of China', 'Confucianism', 'Chinese Inventions',
            'Mali Empire', 'Great Zimbabwe', 'Axum', 'Songhai Empire', 'Mansa Musa',
            'Mayan Calendar', 'Tikal', 'Chichen Itza', 'Mayan Hieroglyphs',
            'Tenochtitlan', 'Aztec Religion', 'Hernan Cortes', 'Machu Picchu', 'Inca Road System', 'Quipu', 'Andean Civilization',
            'Indus Valley Civilization', 'Maurya Empire', 'Gupta Empire', 'Buddhism', 'Hinduism',
            'Hagia Sophia', 'Justinian I', 'Byzantine Art', 'Eastern Orthodox Church',
            'Genghis Khan', 'Silk Road', 'Yurts', 'Khanates','protest',
            'Samurai', 'Shogun', 'Bushido', 'Feudal Japan',
            'Ethiopian Orthodox Tewahedo Church', 'Lalibela', 'Rock-Hewn Churches',
            'The Crusades', 'The Reformation', 'The Enlightenment', 'Religious Wars', 'European Colonial Empires', 'Exploration', 'Impact on Indigenous Peoples',
            'World War I', 'World War II', 'Holocaust', 'Treaty of Versailles',
            'The Cold War', 'Cuban Missile Crisis', 'Berlin Wall', 'Proxy Wars',
            'Leonardo da Vinci', 'Michelangelo', 'Humanism', 'Industrialization', 'Steam Engine', 'Urbanization', 'Factory System', 'African American Civil Rights', 'Martin Luther King Jr.', 'Rosa Parks',
            'Independence Day', '20th Century History', 'Globalization', 'Digital Revolution', 'Space Race',
            'Royal', 'dynasty of kings','Empire', 'Colonization', 'War', 'Treaty', 'indigenous', 'Colonies', 'Archaeology', 'Architectural History', 'Artifact', 'BC', 'BCE', 'Rich History'


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
        const loadingSpinner = document.createElement('div');
        loadingSpinner.classList.add('loading-spinner');
    
        // Create a container for the messages
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-container'); // Add the new class
    
        // Add the "Patience, young grasshopper" message
        const patienceMessage = document.createElement('div');
        patienceMessage.textContent = 'Patience, young grasshopper';
    
        // Add the "Good things come to those who wait 🧠" quote
        const quote = document.createElement('div');
        quote.textContent = 'Good things come to those who wait 🧠';
    
        // Append the messages to the container
        messageContainer.appendChild(patienceMessage);
        messageContainer.appendChild(quote);
    
        // Append the loading spinner and message container to the factElement
        factElement.appendChild(loadingSpinner);
        factElement.appendChild(messageContainer);    
    } else {
        // Create a div for the text content
        const textContentDiv = document.createElement('div');
        textContentDiv.textContent = factData.extract;
        textContentDiv.classList.add('fact-text'); // Add a class for styling if needed

        // Append the text content div to the fact card
        factElement.appendChild(textContentDiv);

        // Create a div for the image
        if (factData.image) {
            const imageElement = document.createElement('img');
            imageElement.src = factData.image;
            imageElement.classList.add('fact-image', 'max-image-size');
            
            // Append the image to the fact card after the text
            factElement.appendChild(imageElement);
        }
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

    while (facts.length < currentFactIndex + factsPerPage) {
        try {
            console.log(`Fetching fact ${facts.length + 1}...`);
            // Create a loading message while fetching
            const loadingFactCard = createFactCard({}, true);
            factContainer.appendChild(loadingFactCard);

            const factData = await fetchRandomFact(filterCategory);

            // Ensure that the loadingFactCard is still in the factContainer before removing it
            if (factContainer.contains(loadingFactCard)) {
                // Remove the loading message
                factContainer.removeChild(loadingFactCard);

                if (factData && factData.extract) {
                    // Create a fact card for the fetched fact and add it to the factContainer
                    const factCard = createFactCard(factData);
                    factContainer.appendChild(factCard);
                    facts.push(factData);
                    console.log(`Fact ${facts.length} fetched successfully.`);
                } else {
                    console.log(`Fact ${facts.length + 1} skipped because it has no data.`);
                }
            }
        } catch (error) {
            // Handle errors, e.g., if fetching the fact fails
            console.error('Error loading fact:', error);
            console.log(`Fact ${facts.length + 1} fetched successfully.`);
        }
    }

    // Update the currentFactIndex to keep track of the facts loaded so far
    currentFactIndex += factsPerPage;

    isLoadingFacts = false;
}

factContainer.addEventListener('scroll', () => {
    const scrollPosition = factContainer.scrollTop;
    const containerHeight = factContainer.clientHeight;
    const contentHeight = factContainer.scrollHeight;

    // Calculate the scroll percentage (how far down the user has scrolled)
    const scrollPercentage = (scrollPosition / (contentHeight - containerHeight)) * 100;

    if (scrollPercentage >= 90) {
        loadNextFacts(); // Load more facts when scrolled to 90% or more
    }
});

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
