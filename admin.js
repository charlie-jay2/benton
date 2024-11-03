async function loadBookedSeats() {
    const bookedSeatsDiv = document.getElementById("booked-seats");
    bookedSeatsDiv.innerHTML = "Loading booked seats...";

    try {
        const response = await fetch('/.netlify/functions/manageSeats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "getAll" })
        });
        const bookedSeats = await response.json();

        bookedSeatsDiv.innerHTML = ""; // Clear previous content
        bookedSeats.forEach(seat => {
            const seatElement = document.createElement("div");
            seatElement.classList.add("booked-seat");
            seatElement.innerHTML = `
                <input type="checkbox" class="delete-checkbox" data-id="${seat._id}">
                Seat: ${seat.seatNumber}, User: ${seat.robloxUsername}
                <button onclick="deleteSeat('${seat._id}')">Delete</button>
            `;
            bookedSeatsDiv.appendChild(seatElement);
        });
    } catch (error) {
        bookedSeatsDiv.innerHTML = "Failed to load booked seats.";
        console.error("Error loading booked seats:", error);
    }
}

async function deleteSeat(seatId) {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
        const response = await fetch('/.netlify/functions/manageSeats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "delete", seatId })
        });

        const result = await response.json();
        if (result.success) {
            alert("Booking deleted successfully.");
            loadBookedSeats(); // Refresh the seat list
        } else {
            alert("Failed to delete booking.");
        }
    } catch (error) {
        console.error("Error deleting booking:", error);
    }
}

document.getElementById("delete-selected").addEventListener("click", async function () {
    const checkboxes = document.querySelectorAll(".delete-checkbox:checked");
    const idsToDelete = Array.from(checkboxes).map(checkbox => checkbox.getAttribute("data-id"));

    if (idsToDelete.length === 0) {
        alert("Please select at least one booking to delete.");
        return;
    }

    const confirmed = confirm(`Are you sure you want to delete the following bookings: ${idsToDelete.join(", ")}?`);

    if (confirmed) {
        try {
            const response = await fetch('/.netlify/functions/manageSeats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "deleteMany", seatIds: idsToDelete })
            });

            const result = await response.json();
            if (result.success) {
                alert("Selected bookings deleted successfully.");
                loadBookedSeats(); // Refresh the seat list
            } else {
                alert("Failed to delete selected bookings.");
            }
        } catch (error) {
            console.error("Error deleting selected bookings:", error);
        }
    }
});

// Load booked seats on page load
window.onload = loadBookedSeats;
