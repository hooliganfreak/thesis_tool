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
        console.log("The ID you want to delete is: ", index)

        // Close the modal after deletion
        deleteModal.hide();
    });
}