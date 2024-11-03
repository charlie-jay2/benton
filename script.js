document.addEventListener("DOMContentLoaded", async () => {
    const seatContainer = document.getElementById("seat-container");
    const bookingForm = document.getElementById("booking-form");
    const seatsChosenField = document.getElementById("seatsChosen");
    const robloxUsernameField = document.getElementById("robloxUsername");
    let selectedSeats = [];

    // Function to generate seats
    async function generateSeating() {
        const response = await fetch('/.netlify/functions/updateSeat');
        const seats = await response.json();

        // Total rows and columns
        const rows = 5; // Updated number of rows to include Row E
        const seatsPerRow = 9; // Base for rows A to D

        // Clear existing seats
        seatContainer.innerHTML = '';

        for (let row = 0; row < rows; row++) {
            // Create a div for each row
            const rowDiv = document.createElement("div");
            rowDiv.className = "row"; // Add class for styling

            let seatsInRow = seatsPerRow; // Default seats in a row

            // Adjust the number of seats for Row E and F/G
            if (row === 4) {
                seatsInRow = 6; // Row E has 6 seats
                rowDiv.style.backgroundColor = "#e6f7ff"; // Lighter background for Row E
            } else if (row === 5) {
                seatsInRow = 2; // Only F1 and G1
                rowDiv.style.backgroundColor = "#e6f7ff"; // Lighter background for Rows F and G
            }

            for (let seatIndex = 1; seatIndex <= seatsInRow; seatIndex++) {
                // Generate seat number (A1, A2, ..., E6, F1, G1)
                let seatNumber;
                if (row === 4) {
                    seatNumber = 'E' + seatIndex; // Row E
                } else if (row === 5 && seatIndex === 1) {
                    seatNumber = 'F1'; // Side seat F1
                } else if (row === 5 && seatIndex === 2) {
                    seatNumber = 'G1'; // Side seat G1
                } else {
                    seatNumber = String.fromCharCode(65 + row) + seatIndex; // A-D
                }

                const seat = seats.find(s => s.seatNumber === seatNumber) || { isBooked: false };

                const seatDiv = document.createElement("div");
                seatDiv.className = "seat";
                seatDiv.textContent = seatNumber;

                if (seat.isBooked) {
                    seatDiv.classList.add("booked");
                } else {
                    seatDiv.addEventListener("click", () => toggleSeatSelection(seatDiv, seatNumber));
                }

                rowDiv.appendChild(seatDiv); // Add each seat to the row
            }

            seatContainer.appendChild(rowDiv); // Add the completed row to the seat container
        }
    }

    // Call the function to generate seats
    await generateSeating();

    // Toggle seat selection
    function toggleSeatSelection(seatDiv, seatNumber) {
        if (selectedSeats.includes(seatNumber)) {
            selectedSeats = selectedSeats.filter(seat => seat !== seatNumber);
            seatDiv.classList.remove("selected");
        } else {
            if (selectedSeats.length < 3) { // Limit selection to 3 seats
                selectedSeats.push(seatNumber);
                seatDiv.classList.add("selected");
            } else {
                alert("You can only select up to 3 seats.");
            }
        }

        // Show form and selected seats
        if (selectedSeats.length > 0) {
            bookingForm.style.display = "block";
            seatsChosenField.value = selectedSeats.join(", ");
        } else {
            bookingForm.style.display = "none";
        }
    }

    // Handle form submission
    bookingForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const robloxUsername = robloxUsernameField.value;
        for (let seatNumber of selectedSeats) {
            await fetch('/.netlify/functions/updateSeat', {
                method: "POST",
                body: JSON.stringify({ seatNumber, robloxUsername }),
                headers: { "Content-Type": "application/json" }
            });
        }

        alert("Booking successful!");
        window.location.reload();
    });

    // Load seats on page load
    await generateSeating();
});
