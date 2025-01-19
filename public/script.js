// MAIN

document.addEventListener('DOMContentLoaded', function() {
    authToken = localStorage.getItem('authToken'); 
    toggleAdminControls(!!authToken);
    showSection('biography');
});

function showSection(section) {
    const sections = ['biography', 'paintings', 'exhibitions', 'links', 'admin', 'add-link-content', 'add-exhibition-content'];
    sections.forEach(s => {
        document.getElementById(s + '-menu')?.classList.add('hidden');
        document.getElementById(s + '-content')?.classList.add('hidden');
    });
    document.getElementById(section + '-menu')?.classList.remove('hidden');
    document.getElementById(section + '-content')?.classList.remove('hidden');

    if (section === 'paintings') {
        document.getElementById('paintings-content').classList.remove('hidden');
    }
}

// BIOGRAPHY

function showSubSection(subSection) {
    const subSections = ['life', 'style', 'reputation'];
    subSections.forEach(s => {
        document.getElementById(s + '-content')?.classList.add('hidden');
    });
    document.getElementById(subSection + '-content')?.classList.remove('hidden');
}

// PAINTINGS

function showPaintingSection(section) {
    const paintingSections = ['portraits', 'nature'];
    paintingSections.forEach(s => {
        document.getElementById(s + '-content')?.classList.add('hidden');
    });
    document.getElementById(section + '-content')?.classList.remove('hidden');
}

// ADMIN

function toggleAdminControls(isLoggedIn) {
    const adminControls = document.getElementById('admin-controls');
    const loginForm = document.getElementById('login-section');
    const logoutSection = document.getElementById('logout-section');

    if (isLoggedIn) {
        loginForm.classList.add('hidden');
        adminControls.classList.remove('hidden');
        logoutSection.classList.remove('hidden');
    } else {
        loginForm.classList.remove('hidden');
        adminControls.classList.add('hidden');
        logoutSection.classList.add('hidden');
    }
}

function toggleEditSection(section) {
    const addLinkContent = document.getElementById('add-link-content');
    const addExhibitionContent = document.getElementById('add-exhibition-content');

    if (section === 'links') {
        addLinkContent.classList.remove('hidden');
        addExhibitionContent.classList.add('hidden'); 
    } else if (section === 'exhibitions') {
        addExhibitionContent.classList.remove('hidden');
        addLinkContent.classList.add('hidden'); 
    }
}

let authToken = null;

async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) throw new Error('Login failed');

        const data = await response.json();
        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        alert('Login successful');
        toggleAdminControls(true);
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials.');
    }
}

function handleLogout() {
    authToken = null;
    localStorage.removeItem('authToken'); 
    toggleAdminControls(false);
    alert('You have been logged out.');
}

// FETCH LINKS

async function fetchLinks(category) {
    try {
        const response = await fetch(`/api/${category}`);
        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        displayData(category, data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function displayData(category, data) {
    const content = document.getElementById('content');
    content.innerHTML = `<h2>${category.toUpperCase()}</h2>`;

    if (!data.length) {
        content.innerHTML += '<p>No data available.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'styled-table';

    const headers = Object.keys(data[0]);
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.replace(/_/g, ' ').toUpperCase(); 
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        Object.entries(row).forEach(([key, value]) => {
            const td = document.createElement('td');
            if (key === 'url' && category === 'links') {
                td.innerHTML = `<a href="${value}" target="_blank">${value}</a>`;
            } else {
                td.textContent = value;
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    content.appendChild(table);
}

// ADD LINK

async function addLink() {
    if (!authToken) {
        alert('You must be logged in to add links.');
        return;
    }

    const title = document.getElementById('link-title').value;
    const url = document.getElementById('link-url').value;
    const category = document.getElementById('link-category').value;

    try {
        const response = await fetch('/api/links', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ title, url, category }),
        });

        if (!response.ok) throw new Error('Failed to add link');

        alert('Link added successfully');
    } catch (error) {
        console.error('Error adding link:', error);
        alert('Failed to add link.');
    }
}

// ADD EXHIBITION

async function addExhibition() {
    if (!authToken) {
        alert('You must be logged in to add exhibitions.');
        return;
    }

    const title = document.getElementById('exhibition-title').value;
    const location = document.getElementById('exhibition-location').value;
    const date = document.getElementById('exhibition-date').value;
    const category = document.getElementById('exhibition-category').value;

    try {
        const response = await fetch('/api/exhibitions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ title, location, date, category }),
        });

        if (!response.ok) throw new Error('Failed to add exhibition');

        alert('Exhibition added successfully');
    } catch (error) {
        console.error('Error adding exhibition:', error);
        alert('Failed to add exhibition.');
    }
}
