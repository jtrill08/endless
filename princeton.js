        // Function to fetch the tombstone data and primary image for a random object
        function fetchRandomObject() {
            // Generate a random object ID (you can adjust the range as needed)
            const randomObjectId = Math.floor(Math.random() * 50000) + 1; // Change the range as needed

            // Fetch the tombstone data
            fetch(`https://data.artmuseum.princeton.edu/objects/${randomObjectId}/tombstone`)
                .then(response => response.json())
                .then(data => {
                    // Check if the data includes a primary image
                    if (data.primaryimage) {
                        // Create a new div for each artwork
                        const artDiv = document.createElement('div');
                        artDiv.classList.add('artwork-item');

                        // Display the tombstone data on the webpage
                        artDiv.innerHTML = `
                            <h2>${data.displaytitle}</h2>
                            <p><strong>Artist:</strong> <span>${data.displaymaker}</span></p>
                            <p><strong>Date:</strong> <span>${data.displaydate}</span></p>
                            <p><strong>Medium:</strong> <span>${data.medium}</span></p>
                            <p><strong>Dimensions:</strong> <span>${data.dimensions}</span></p>
                            <img src="${data.primaryimage}/full/!400,400/0/default.jpg" alt="Art Image">
                        `;

                        // Append the artwork div to the artwork-container container
                        document.getElementById('artwork-container').appendChild(artDiv);
                    } else {
                        // Retry with another object if there is no primary image
                        fetchRandomObject();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }

        // Function to fetch and display more artworks when the user scrolls
        function fetchMoreArtworks() {
            fetchRandomObject();
        }

        // Call the fetchRandomObject function when the page loads
        window.addEventListener('load', () => {
            for (let i = 0; i < 5; i++) {
                fetchRandomObject();
            }
        });

        // Add event listener for scrolling
        window.addEventListener('scroll', () => {
            // Check if the user has scrolled to the bottom of the page
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                // Load more artworks
                fetchMoreArtworks();
            }
        });

        console.log('Fetched from princeton:'); 
