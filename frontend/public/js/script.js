const token = localStorage.getItem('accessToken')
let startDate = new Date().toISOString().split('T')[0]
let endDate = new Date().toISOString().split('T')[0]
let currentPage = 1
const limit = 10

if (!token) {
    window.location.href = '/admin/login';
}

const SELECTOR_SIDEBAR_WRAPPER = '.sidebar-wrapper';
const Default = {
    scrollbarTheme: 'os-theme-light',
    scrollbarAutoHide: 'leave',
    scrollbarClickScroll: true,
};
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('user-name').innerText = localStorage.getItem('name')

    const sidebarWrapper = document.querySelector(SELECTOR_SIDEBAR_WRAPPER);
    if (sidebarWrapper && typeof OverlayScrollbarsGlobal?.OverlayScrollbars !== 'undefined') {
        OverlayScrollbarsGlobal.OverlayScrollbars(sidebarWrapper, {
            scrollbars: {
                theme: Default.scrollbarTheme,
                autoHide: Default.scrollbarAutoHide,
                clickScroll: Default.scrollbarClickScroll,
            },
        })
    }

    
})

const fetchData = async (page = 1) => {
    try {
        const response = await axios.get('/api/register', {
            params: {
                page: page,
                limit: limit,
                startDate: startDate,
                endDate: endDate
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const { data, pagination } = response.data
        const tableBody = document.getElementById('table-body')
        tableBody.innerHTML = '' // Clear previous data
        data.forEach((item, index) => {
            const age = getAge(item.tgl_lahir)
            const jenisKelamin = item.jk === 'L' ? 'Laki-laki' : item.jk === 'P' ? 'Perempuan' : 'Tidak diketahui';
            const row = document.createElement('tr')
            row.innerHTML = `
                <td>${(pagination.page - 1) * limit + index + 1}</td>
                <td>${item.nama}</td>
                <td>${item.nik}</td>
                <td>${jenisKelamin}</td>
                <td>${item.tgl_lahir.split('T')[0]} / ${age} Th</td>
                <td>${item.alamat}</td>
                <td>${item.nohp}</td>
                <td>${item.tanggal.split('T')[0]}</td>
                <td>${item.keluhan}</td>
                <td><button class="btn btn-primary" onclick="editRegister('${item.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteRegister('${item.id}')">Delete</button></td>
            `
            tableBody.appendChild(row)
        })

        const paginationElement = document.getElementById('pagination')
        paginationElement.innerHTML = '' // Clear previous pagination


        currentPage = pagination.page
        const pageInfo = document.getElementById('page-info')
        pageInfo.innerHTML = `Page ${pagination.page} of ${pagination.totalPage}`
        updatePagination(pagination.page, pagination.totalPage)

    } catch (error) {
        console.error('Error fetching data:', error)
        alert('Error fetching data. Please try again later.')
    }

}

const updatePagination = (page, totalPage) => {
    const paginationElement = document.getElementById('pagination')
    paginationElement.innerHTML = `
    <li class="page-item ${page === 1 ? 'disabled' : ''}">
        <a id="prev-page" class="page-link" href="#" onclick="fetchData(${page - 1})">&laquo;</a>
    </li>
    `
    for (let i = 1; i <= totalPage; i++) {
        const li = document.createElement('li')
        li.classList.add('page-item')

        const a = document.createElement('a')
        a.classList.add('page-link')
        a.href = '#'
        a.textContent = i

        if (i === page) {
            li.classList.add('active')
            a.style.pointerEvents = 'none' // Disable click
        } else {
            a.setAttribute('onclick', `fetchData(${i})`)
        }

        li.appendChild(a)
        paginationElement.appendChild(li)
    }

    paginationElement.innerHTML += `
    <li class="page-item ${page === totalPage ? 'disabled' : ''}">
        <a id="next-page" class="page-link" href="#" onclick="fetchData(${page + 1})">&raquo;</a>
    </li>
    `
}

const getAge = dateString => {
    const birthDate = new Date(dateString)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }
    return age
}

const logout = () => {
    const confirmLogout = confirm("Apakah Anda yakin ingin keluar?");
    if (confirmLogout) {
        // Clear all localStorage
        localStorage.clear();

        // Optional: Redirect to login page
        window.location.href = "/admin/login";
    }
}

const today = () => {
    const today = new Date().toISOString().split('T')[0]

    document.getElementById('tanggal-periksa').value = today
}

const clearForm = () => {
    document.getElementById('add-data-form').reset()

    document.getElementById('name').value = ''
    document.getElementById('nik').value = ''
    document.getElementById('alamat').value = ''
    document.getElementById('telepon').value = ''
    document.getElementById('tanggal-lahir').value = ''
    document.getElementById('jenis-kelamin').value = ''
    document.getElementById('tanggal-periksa').value = ''
    document.getElementById('keluhan').value = ''
    document.getElementById('diagnosa').value = ''
    document.getElementById('tindakan').value = ''
    document.getElementById('obat').value = ''
    document.getElementById('biaya').value = ''
}

const insertData = async () => {
    const data = {
        nama: document.getElementById('name').value.trim(),
        nik: document.getElementById('nik').value.trim(),
        alamat: document.getElementById('alamat').value.trim(),
        nohp: document.getElementById('telepon').value.trim(),
        tglLahir: document.getElementById('tanggal-lahir').value,
        jk: document.getElementById('jenis-kelamin').value,
        tanggalDaftar: document.getElementById('tanggal-periksa').value,
        keluhan: document.getElementById('keluhan').value.trim(),
        diagnosa: document.getElementById('diagnosa').value.trim(),
        tindakan: document.getElementById('tindakan').value.trim(),
        obat: document.getElementById('obat').value.trim(),
        total: document.getElementById('biaya').value.replace(/[^\d]/g, '')
    };

    try {
        const response = await axios.post('/api/register/complete', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        clearForm();

        window.location = '/admin/'
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Gagal menyimpan data. Silakan coba lagi.');
    }
}

const editRegister = registerId => {
    window.location = '/admin/edit/' + registerId
}

const updateData = async (id) => {
    const data = {
        nama: document.getElementById('name').value.trim(),
        nik: document.getElementById('nik').value.trim(),
        alamat: document.getElementById('alamat').value.trim(),
        nohp: document.getElementById('telepon').value.trim(),
        tglLahir: document.getElementById('tanggal-lahir').value,
        jk: document.getElementById('jenis-kelamin').value,
        tanggalDaftar: document.getElementById('tanggal-periksa').value,
        keluhan: document.getElementById('keluhan').value.trim(),
        diagnosa: document.getElementById('diagnosa').value.trim(),
        tindakan: document.getElementById('tindakan').value.trim(),
        obat: document.getElementById('obat').value.trim(),
        total: document.getElementById('biaya').value.replace(/[^\d]/g, '')
    };

    try {
        const response = await axios.post('/api/register/'+id, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        clearForm();

        window.location = '/admin/'
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Gagal menyimpan data. Silakan coba lagi.');
    }
}