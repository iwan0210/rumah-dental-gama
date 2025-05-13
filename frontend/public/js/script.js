const getCurrentDateInWIB = () => {
    const wib = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    return wib.getFullYear() + '-' + String(wib.getMonth() + 1).padStart(2, '0') + '-' + String(wib.getDate()).padStart(2, '0');
}

const token = localStorage.getItem('accessToken')
let startDate = getCurrentDateInWIB()
let endDate = getCurrentDateInWIB()
let currentPage = 1
const limit = 10
let listData = []

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
        listData = data
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
                <button class="btn btn-danger" onclick="deleteRegister('${item.id}')">Delete</button>
                ${item.total ? `<button class="btn btn-success" onclick="printRegister('${item.id}')">Print</button>` : ''}
                </td>
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
    const today = getCurrentDateInWIB()

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
        await axios.post('/api/register/complete', data, {
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
        await axios.put('/api/register/' + id, data, {
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

const deleteRegister = async (id) => {
    try {
        const confirmDelete = confirm("Apakah Anda yakin ingin menghapus data ini?");
        if (confirmDelete) {
            await axios.delete('/api/register/' + id, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchData(currentPage)
        }
    } catch (error) {
        console.error('Error deleting data:', error);
        alert('Gagal menghapus data. Silakan coba lagi.');
    }
}

const printRegister = id => {

    const item = listData.find(item => item.id === id);
    if (!item) {
        alert('Data tidak ditemukan');
        return;
    }

    const invoiceWindow = window.open('', '_blank');

    invoiceWindow.onload = () => {
        const doc = invoiceWindow.document;

        // Build styles
        const style = `
        body {
            font-family: monospace;
            font-size: 12px;
            width: 80mm;
            padding: 5px;
        }
        .center {
            text-align: center;
        }
        .line {
            border-top: 1px dashed #000;
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td {
            padding: 2px 0;
            vertical-align: top;
        }
        .label {
            width: 35%;
        }
        .value {
            width: 65%;
        }
        .total {
            font-weight: bold;
            font-size: 13px;
            margin-top: 10px;
        }
    `;

        // Append <style> tag
        const styleEl = doc.createElement('style');
        styleEl.textContent = style;
        doc.head.appendChild(styleEl);

        // Format tindakan and obat with line breaks
        const tindakan = (item.tindakan || '-').replace(/\n/g, '<br>');
        const obat = (item.obat || '-').replace(/\n/g, '<br>');

        // Set the body HTML content
        doc.body.innerHTML = `
        <div class="center">
            <h3>Rumah Dental Gama</h3>
            <div>Gg. Kasuari, Bogoran, Kauman, Kabupaten Batang</div>
            <div>Telp: 0823-1454-1887</div>
            <div class="line"></div>
            <strong>INVOICE</strong>
            <div>${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
        </div>
        <div class="line"></div>
        <table>
            <tr><td class="label">Nama</td><td>:</td><td class="value">${item.nama}</td></tr>
            <tr><td class="label">NIK</td><td>:</td><td class="value">${item.nik}</td></tr>
            <tr><td class="label">Alamat</td><td>:</td><td class="value">${item.alamat}</td></tr>
            <tr><td class="label">No HP</td><td>:</td><td class="value">${item.nohp}</td></tr>
            <tr><td class="label">Tgl Periksa</td><td>:</td><td class="value">${item.tanggal}</td></tr>
            <tr><td class="label">Tindakan</td><td>:</td><td class="value">${tindakan}</td></tr>
            <tr><td class="label">Obat</td><td>:</td><td class="value">${obat}</td></tr>
        </table>
        <div class="line"></div>
        <div class="total">Total: Rp ${Number(item.total).toLocaleString('id-ID')}</div>
        <div class="line"></div>
        <div class="center">-- Terima Kasih --</div>
    `;

        // Trigger print
        invoiceWindow.focus();
        invoiceWindow.print();

        // Close after print
        invoiceWindow.onafterprint = () => {
            invoiceWindow.close();
        };
    };
}

const searchPatient = async () => {
    const nik = document.getElementById('nik').value.trim()
    if (nik.length < 16) {
        alert('NIK tidak valid')
        return
    }

    try {
        const response = await axios.get('/api/register/patient/' + nik, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const { data } = response.data

        document.getElementById('name').value = data.nama
        document.getElementById('alamat').value = data.alamat
        document.getElementById('telepon').value = data.nohp
        document.getElementById('tanggal-lahir').value = data.tgl_lahir
        document.getElementById('jenis-kelamin').value = data.jk
    } catch (error) {
        alert('Error fetching data. Please try again later.')
    }
}

const fetchFinance = async () => {
    const selectedYear = document.getElementById('select-year').value.trim()
    try {
        const response = await axios.get('/api/register/finance/' + selectedYear, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const { data } = response.data

        const tableBody = document.getElementById('table-body')
        tableBody.innerHTML = '' // Clear previous data
        data.forEach((item, index) => {
            const row = document.createElement('tr')
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.tahun}</td>
                <td>${item.bulan}</td>
                <td>${item.jumlah_pasien}</td>
                <td>Rp ${item.total.toLocaleString('id-ID')}</td>
            `
            tableBody.appendChild(row)
        })
        const row = document.createElement('tr')
        row.innerHTML = `
            <td colspan="3" class="text-center">Total</td>
            <td>${data.reduce((acc, item) => acc + item.jumlah_pasien, 0)}</td>
            <td>Rp ${data.reduce((acc, item) => acc + item.total, 0).toLocaleString('id-ID')}</td>
        `
        tableBody.appendChild(row)
    } catch (error) {
        const tableBody = document.getElementById('table-body')
        tableBody.innerHTML = '' // Clear previous data
        const row = document.createElement('tr')
        row.innerHTML = `
            <td colspan="5" class="text-center">Data tidak ditemukan</td>
        `
        tableBody.appendChild(row)
        console.error('Error fetching data:', error)
    }
}