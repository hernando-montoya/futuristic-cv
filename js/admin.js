let currentData = null;

const SECTIONS = ['personalInfo', 'experiences', 'education', 'skills', 'languages', 'aboutDescription'];

document.addEventListener('DOMContentLoaded', async () => {
    // Check Authentication state
    firebase.auth().onAuthStateChanged(async (user) => {
        const overlay = document.getElementById('login-overlay');

        if (user) {
            // User is signed in
            console.log("User authenticated:", user.email);
            overlay.classList.add('hidden');
            await initAdmin();
        } else {
            // User is signed out
            overlay.classList.remove('hidden');
            setupLoginListeners();
        }
    });
});

function setupLoginListeners() {
    const emailInput = document.getElementById('auth-email');
    const passInput = document.getElementById('auth-password');
    const btn = document.getElementById('login-btn');
    const error = document.getElementById('login-error');

    const doLogin = async () => {
        const email = emailInput.value;
        const password = passInput.value;

        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            // onAuthStateChanged will handle the rest
        } catch (e) {
            console.error("Login failed:", e);
            error.textContent = "LOGIN FAILED: " + e.message;
            error.classList.remove('hidden');
        }
    };

    // Remove old listeners to avoid duplicates if called multiple times
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', doLogin);
    passInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doLogin();
    });
}

async function initAdmin() {
    currentData = await Storage.load();
    if (!currentData) {
        console.error("Failed to load data");
        return;
    }

    renderSidebar();

    // Export button listener
    document.getElementById('export-btn').addEventListener('click', () => {
        Storage.export();
    });

    // Reset button listener
    document.getElementById('reset-btn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to reset all data to defaults? This cannot be undone.')) {
            currentData = await Storage.reset();
            renderSidebar();
            document.getElementById('editor-area').innerHTML = '<h2 class="text-xl text-gray-400 mb-4">Data reset successfully. Select a section to edit.</h2>';
        }
    });
}

function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = '';

    SECTIONS.forEach(section => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left py-2 px-4 rounded text-gray-400 hover:bg-gray-700 hover:text-white transition-colors mb-1 capitalize';
        btn.textContent = section.replace(/([A-Z])/g, ' $1').trim(); // Add space before caps
        btn.onclick = () => loadEditor(section);
        nav.appendChild(btn);
    });
}

function loadEditor(sectionKey) {
    const editorArea = document.getElementById('editor-area');
    editorArea.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-6 border-b border-gray-700 pb-4';
    header.innerHTML = `
        <h2 class="text-2xl font-orbitron text-cyan-400 capitalize">${sectionKey.replace(/([A-Z])/g, ' $1')}</h2>
        <button onclick="saveSection('${sectionKey}')" class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-all">Save Changes</button>
    `;
    editorArea.appendChild(header);

    // Ensure section exists in data, if not initialize it
    if (!currentData[sectionKey]) {
        currentData[sectionKey] = Array.isArray(sectionKey) ? [] : {}; // Simplistic init, might need refinement based on schema
    }

    const content = currentData[sectionKey];
    const formContainer = document.createElement('div');
    formContainer.id = 'form-container';

    if (Array.isArray(content)) {
        renderArrayEditor(sectionKey, content, formContainer);
    } else if (typeof content === 'object') {
        renderObjectEditor(sectionKey, content, formContainer);
    } else {
        renderSimpleEditor(sectionKey, content, formContainer);
    }

    editorArea.appendChild(formContainer);
}

function renderObjectEditor(parentKey, data, container) {
    Object.keys(data).forEach(key => {
        const wrapper = document.createElement('div');
        wrapper.className = 'mb-4';

        const label = document.createElement('label');
        label.className = 'block text-gray-400 text-sm font-bold mb-2 capitalize';
        label.textContent = key.replace(/([A-Z])/g, ' $1');

        const input = createInput(data[key], `${parentKey}.${key}`, (newVal) => {
            data[key] = newVal;
        });

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        container.appendChild(wrapper);
    });
}

function renderArrayEditor(parentKey, data, container) {
    const listContainer = document.createElement('div');
    listContainer.className = 'space-y-4';

    data.forEach((item, index) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'bg-gray-700 p-4 rounded border border-gray-600 relative';

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'absolute top-2 right-2 text-red-400 hover:text-red-300';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.onclick = () => {
            currentData[parentKey].splice(index, 1);
            loadEditor(parentKey); // Re-render
        };
        itemCard.appendChild(deleteBtn);

        if (typeof item === 'object') {
            Object.keys(item).forEach(key => {
                if (key === 'id') return; // Skip ID editing

                const wrapper = document.createElement('div');
                wrapper.className = 'mb-2';

                const label = document.createElement('label');
                label.className = 'block text-gray-400 text-xs mb-1 capitalize';
                label.textContent = key;

                const input = createInput(item[key], `${parentKey}[${index}].${key}`, (newVal) => {
                    item[key] = newVal;
                });

                wrapper.appendChild(label);
                wrapper.appendChild(input);
                itemCard.appendChild(wrapper);
            });
        } else {
            // Simple array of strings
            const input = createInput(item, `${parentKey}[${index}]`, (newVal) => {
                currentData[parentKey][index] = newVal;
            });
            itemCard.appendChild(input);
        }

        listContainer.appendChild(itemCard);
    });

    // Add New Item Button
    const addBtn = document.createElement('button');
    addBtn.className = 'w-full py-2 border-2 border-dashed border-gray-600 text-gray-400 hover:border-cyan-500 hover:text-cyan-500 rounded mt-4 transition-colors';
    addBtn.textContent = '+ Add New Item';
    addBtn.onclick = () => {
        // Clone the first item structure if available, else empty object
        let template = {};
        if (data.length > 0 && typeof data[0] === 'object') {
            template = JSON.parse(JSON.stringify(data[0]));
            Object.keys(template).forEach(k => template[k] = (k === 'id' ? Date.now().toString() : ''));
        } else if (data.length > 0) {
            template = '';
        } else {
            // Fallback for empty array, try to guess based on section name or just add empty object
            template = { id: Date.now().toString() };
        }

        currentData[parentKey].push(template);
        loadEditor(parentKey);
    };

    container.appendChild(listContainer);
    container.appendChild(addBtn);
}

function createInput(value, path, onChange) {
    let input;

    // Handle null/undefined values by defaulting to empty string for editing
    if (value === null || value === undefined) {
        value = '';
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
        // Handle nested objects like multi-language strings (en, es, fr)
        const wrapper = document.createElement('div');
        wrapper.className = 'pl-4 border-l-2 border-gray-600 grid grid-cols-1 md:grid-cols-3 gap-4'; // Grid for languages

        const languages = ['en', 'es', 'fr'];
        const keys = Object.keys(value);

        // Sort keys to ensure en, es, fr order if present
        keys.sort((a, b) => {
            const idxA = languages.indexOf(a);
            const idxB = languages.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });

        keys.forEach(subKey => {
            const subWrapper = document.createElement('div');
            subWrapper.className = 'mb-2';

            const subLabel = document.createElement('label');
            subLabel.className = 'flex items-center gap-2 text-gray-500 text-xs mb-1 uppercase font-bold';

            // Add language flag/badge
            let badgeColor = 'bg-gray-600';
            if (subKey === 'en') badgeColor = 'bg-blue-600';
            if (subKey === 'es') badgeColor = 'bg-yellow-600';
            if (subKey === 'fr') badgeColor = 'bg-red-600';

            subLabel.innerHTML = `<span class="px-2 py-0.5 rounded text-white ${badgeColor}">${subKey}</span>`;

            const subInput = createInput(value[subKey], `${path}.${subKey}`, (newVal) => {
                value[subKey] = newVal;
            });

            subWrapper.appendChild(subLabel);
            subWrapper.appendChild(subInput);
            wrapper.appendChild(subWrapper);
        });
        return wrapper;
    }

    if (Array.isArray(value)) {
        // Handle array of strings (like description bullet points)
        const wrapper = document.createElement('div');
        value.forEach((val, idx) => {
            const row = document.createElement('div');
            row.className = 'flex gap-2 mb-1';
            const subInput = document.createElement('input');
            subInput.className = 'flex-1 bg-gray-900 text-white px-3 py-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none';
            subInput.value = val || ''; // Handle null in array
            subInput.onchange = (e) => value[idx] = e.target.value;

            const delBtn = document.createElement('button');
            delBtn.className = 'text-red-500 px-2';
            delBtn.textContent = 'x';
            delBtn.onclick = () => {
                value.splice(idx, 1);
                // We need to re-render this specific input group or the whole editor
                // For simplicity, let's trigger a re-render of the parent context if possible, 
                // but here we might just remove the row and update the array reference.
                // A full re-render is safer.
                const parentSection = path.split('.')[0].split('[')[0]; // Rough estimation
                loadEditor(parentSection);
            };

            row.appendChild(subInput);
            row.appendChild(delBtn);
            wrapper.appendChild(row);
        });

        const addBtn = document.createElement('button');
        addBtn.className = 'text-xs text-cyan-400 mt-1';
        addBtn.textContent = '+ Add Line';
        addBtn.onclick = () => {
            value.push('');
            const parentSection = path.split('.')[0].split('[')[0];
            loadEditor(parentSection);
        };
        wrapper.appendChild(addBtn);
        return wrapper;
    }

    // Safe length check
    if (typeof value === 'string' && value.length > 100) {
        input = document.createElement('textarea');
        input.rows = 4;
    } else {
        input = document.createElement('input');
        input.type = 'text';
    }

    input.className = 'w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none';
    input.value = value;

    input.onchange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return input;
}

function saveSection(sectionKey) {
    Storage.save(currentData);
    showToast('Changes saved successfully!');
}

function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded shadow-lg transform translate-y-20 transition-transform duration-300 z-50';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('translate-y-20');
    setTimeout(() => {
        toast.classList.add('translate-y-20');
    }, 3000);
}
