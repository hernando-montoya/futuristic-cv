// Contact Form Modal Logic
const ContactForm = {
    init: () => {
        const modal = document.getElementById('contact-modal');
        const closeBtn = document.getElementById('close-modal');
        const form = document.getElementById('contact-form');
        const successMsg = document.getElementById('success-message');

        // Open modal when email link is clicked
        document.addEventListener('click', (e) => {
            const emailLink = e.target.closest('a[href^="mailto:"]');
            if (emailLink) {
                e.preventDefault();
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        });

        // Close modal
        const closeModal = () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            form.reset();
            successMsg.classList.add('hidden');
        };

        closeBtn.addEventListener('click', closeModal);

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                name: document.getElementById('sender-name').value,
                email: document.getElementById('sender-email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Create mailto link as fallback
            const mailtoLink = `mailto:contact@hernandomontoya.dev?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
                `From: ${formData.name} (${formData.email})\n\n${formData.message}`
            )}`;

            // Open mailto
            window.location.href = mailtoLink;

            // Show success message
            successMsg.classList.remove('hidden');
            form.reset();

            // Close modal after 2 seconds
            setTimeout(closeModal, 2000);
        });
    }
};

// Initialize contact form when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ContactForm.init);
} else {
    ContactForm.init();
}
