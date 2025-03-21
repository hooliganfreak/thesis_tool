// Delete Modal Functionality

// Modal and Buttons
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'), {
    keyboard: false,
    backdrop: 'static'
}); // Initialize the Bootstrap modal

const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Function to show the modal
export function showDeleteModal(index) {
    // Show the modal
    deleteModal.show();

    // Add event listener to confirm button
    confirmDeleteBtn.addEventListener('click', () => {
        // Proceed with the deletion logic
        console.log("The ID you want to delete is: ", index)

        // Optionally, make a DELETE request to the backend here if you're working with a database.

        // Close the modal after deletion
        deleteModal.hide();
    });
}