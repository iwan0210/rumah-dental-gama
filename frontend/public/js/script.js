const getCurrentDateInWIB = () => new Date().toLocaleDateString('sv-SE')

const token = localStorage.getItem('accessToken')
let startDate = getCurrentDateInWIB()
let endDate = getCurrentDateInWIB()
let currentPage = 1
const limit = 10
let listData = []
const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

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

    const toggle = document.getElementById('darkModeToggle')
    const htmlTag = document.documentElement

    const enableDark = () => {
        htmlTag.setAttribute('data-bs-theme', 'dark')
        localStorage.setItem('theme', 'dark')
    }

    const disableDark = () => {
        htmlTag.setAttribute('data-bs-theme', 'light')
        localStorage.setItem('theme', 'light')
    }

    if (localStorage.getItem('theme') == 'dark') {
        enableDark()
        if (toggle) toggle.checked = true
    } else {
        disableDark()
    }

    if (toggle) {
        toggle.addEventListener('change', () => {
            toggle.checked ? enableDark() : disableDark()
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
                <td>${item.no_reg}</td>
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

const logout = async () => {
    const confirmLogout = confirm("Apakah Anda yakin ingin keluar?");
    if (confirmLogout) {

        try {
            await axios.post('/api/users/auth/logout', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error during logout:', error);
            alert('Gagal keluar. Silakan coba lagi.');
            return;
        }

        localStorage.clear();

        window.location.href = "/admin/login";
    }
}

const today = () => {
    const today = getCurrentDateInWIB()

    document.getElementById('tanggal-periksa').value = today
}

const clearForm = () => {
    document.getElementById('add-data-form').reset()
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
    window.location = '/admin/patient/edit/' + registerId
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
        alert('Data tidak ditemukan')
        return;
    }

    const invoiceWindow = window.open('', '_blank')
    if (!invoiceWindow) {
        alert('Popup diblokir. Harap izinkan popup di browser Anda.')
        return;
    }

    const tindakan = (item.tindakan || '-').replace(/\n/g, '<br>')
    const obat = (item.obat || '-').replace(/\n/g, '<br>')

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
    `

    const htmlContent = `
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
        <div class="total">Total: Rp ${Number(item.total || 0).toLocaleString('id-ID')}</div>
        <div class="line"></div>
        <div class="center">-- Terima Kasih --</div>
    `

    const waitForLoad = () => {
        if (invoiceWindow.document.readyState === 'complete') {
            const doc = invoiceWindow.document
            doc.head.innerHTML = ''
            doc.body.innerHTML = ''

            const styleEl = doc.createElement('style');
            styleEl.textContent = style
            doc.head.appendChild(styleEl)

            doc.body.innerHTML = htmlContent

            invoiceWindow.focus()
            invoiceWindow.print()
            invoiceWindow.onafterprint = () => invoiceWindow.close()
        } else {
            setTimeout(waitForLoad, 50)
        }
    }

    waitForLoad()
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
                <td>${bulan[item.bulan - 1]}</td>
                <td>${item.jumlah_pasien}</td>
                <td>Rp ${item.total.toLocaleString('id-ID')}</td>
            `
            tableBody.appendChild(row)
        })

        const totalPasien = data.reduce((acc, item) => acc + item.jumlah_pasien, 0)
        const totalPendapatan = data.reduce((acc, item) => acc + item.total, 0)
        const potongan = totalPendapatan * 0.025
        const totalBersih = totalPendapatan - potongan

        // Row Total
        const totalRow = document.createElement('tr')
        totalRow.innerHTML = `
            <td colspan="3" class="text-center">Total</td>
            <td>${totalPasien}</td>
            <td>Rp ${totalPendapatan.toLocaleString('id-ID')}</td>
        `
        tableBody.appendChild(totalRow)

        // Row Potongan 2,5%
        const potonganRow = document.createElement('tr')
        potonganRow.innerHTML = `
            <td colspan="4" class="text-center">Potongan 2,5%</td>
            <td>Rp ${potongan.toLocaleString('id-ID')}</td>
        `
        tableBody.appendChild(potonganRow)

        // Row Total Bersih
        const bersihRow = document.createElement('tr')
        bersihRow.innerHTML = `
            <td colspan="4" class="text-center">Total Bersih</td>
            <td>Rp ${totalBersih.toLocaleString('id-ID')}</td>
        `
        tableBody.appendChild(bersihRow)
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

const fetchPatientMonthlyReport = async () => {
    const selectedYear = document.getElementById('select-year').value.trim()
    const selectedMonth = document.getElementById('select-month').value.trim()

    try {
        const response = await axios.get('/api/register/patient/monthly', {
            params: {
                year: selectedYear,
                month: selectedMonth
            },
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
                <td>${selectedYear}</td>
                <td>${bulan[selectedMonth - 1]}</td>
                <td>${item.tanggal}</td>
                <td>${item.nama}</td>
                <td>Rp ${item.total.toLocaleString('id-ID')}</td>
            `
            tableBody.appendChild(row)
        })

        const totalAmount = data.reduce((acc, item) => acc + item.total, 0)
        const duaKomaLimaPersen = totalAmount * 0.025
        const totalBersih = totalAmount - duaKomaLimaPersen

        const row = document.createElement('tr')
        row.innerHTML = `
            <td colspan="5" class="text-center">Total</td>
            <td>Rp ${totalAmount.toLocaleString('id-ID')}</td>
        `
        tableBody.appendChild(row)

        const rowDuaKomaLimaPersen = document.createElement('tr')
        rowDuaKomaLimaPersen.innerHTML = `
            <td colspan="5" class="text-center">Potongan 2,5%</td>
            <td>Rp ${duaKomaLimaPersen.toLocaleString('id-ID')}</td>
        `
        tableBody.appendChild(rowDuaKomaLimaPersen)

        const rowTotalBersih = document.createElement('tr')
        rowTotalBersih.innerHTML = `
            <td colspan="5" class="text-center">Total Bersih</td>
            <td>Rp ${totalBersih.toLocaleString('id-ID')}</td>
        `
        tableBody.appendChild(rowTotalBersih)
    } catch (error) {
        const tableBody = document.getElementById('table-body')
        tableBody.innerHTML = '' // Clear previous data
        const row = document.createElement('tr')
        row.innerHTML = `
            <td colspan="8" class="text-center">Data tidak ditemukan</td>
        `
        tableBody.appendChild(row)
        console.error('Error fetching data:', error)
    }
}

const exportExcelMonthly = async () => {
    const selectedYear = document.getElementById('select-year').value.trim()
    const selectedMonth = document.getElementById('select-month').value.trim()

    try {
        const response = await axios.get('/api/register/export/monthly', {
            params: {
                year: selectedYear,
                month: selectedMonth
            },
            headers: {
                Authorization: `Bearer ${token}`
            },
            responseType: 'blob'
        })

        const disposition = response.headers['content-disposition']

        let fileName = `rekap_pasien_${selectedYear}_${selectedMonth}.xlsx`

        if (disposition && disposition.includes('filename=')) {
            const fileNameMatch = disposition.match(/filename="?([^"]+)"?/);
            if (fileNameMatch && fileNameMatch.length > 1) {
                fileName = fileNameMatch[1].trim();
            }
        }

        const url = window.URL.createObjectURL(response.data)

        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()

        a.remove()
        window.URL.revokeObjectURL(url)
    } catch (error) {
        alert('Error fetching data. Please try again later.')
    }
}

const exportExcelDaily = async () => {
    try {
        const response = await axios.get('/api/register/export/daily', {
            params: {
                startDate: startDate,
                endDate: endDate
            },
            headers: {
                Authorization: `Bearer ${token}`
            },
            responseType: 'blob'
        })

        const disposition = response.headers['content-disposition']

        let fileName = `rekap_pasien_${startDate}_to_${endDate}.xlsx`

        if (disposition && disposition.includes('filename=')) {
            const fileNameMatch = disposition.match(/filename="?([^"]+)"?/);
            if (fileNameMatch && fileNameMatch.length > 1) {
                fileName = fileNameMatch[1].trim();
            }
        }

        const url = window.URL.createObjectURL(response.data)

        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()

        a.remove()
        window.URL.revokeObjectURL(url)
    } catch (error) {
        alert('Error fetching data. Please try again later.')
    }
}

const fetchSearchPatient = async () => {
    const query = document.getElementById('input-search').value.trim()

    if (query.length < 3) {
        alert('Minimal 3 karakter')
        return
    }

    try {
        const response = await axios.get('/api/register/search', {
            params: {
                query: query
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const { data } = response.data

        const tableBody = document.getElementById('table-body')
        tableBody.innerHTML = '' // Clear previous data

        if (!data || data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="15" class="text-center">No Data Available.</td>
                </tr>
            `
            return
        }

        data.forEach((item, index) => {
            const age = getAge(item.tgl_lahir)
            const jenisKelamin = item.jk === 'L' ? 'Laki-laki' : item.jk === 'P' ? 'Perempuan' : 'Tidak diketahui';
            const row = document.createElement('tr')
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.nama}</td>
                <td>${item.nik}</td>
                <td>${jenisKelamin}</td>
                <td>${item.tgl_lahir.split('T')[0]} / ${age} Th</td>
                <td>${item.alamat}</td>
                <td>${item.nohp}</td>
                <td>${item.no_reg}</td>
                <td>${item.tanggal.split('T')[0]}</td>
                <td>${item.keluhan}</td>
                <td>${item.diagnosa}</td>
                <td>${item.tindakan}</td>
                <td>${item.obat}</td>
                <td>Rp ${item.total.toLocaleString('id-ID')}</td>
                <td><button class="btn btn-primary" onclick="editRegister('${item.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteRegister('${item.id}')">Delete</button>
            `
            tableBody.appendChild(row)
        })
    } catch (error) {
        console.error('Error fetching data:', error)
        alert('Error fetching data. Please try again later.')
    }
}

const fetchPatientDailyReport = async () => {
    try {
        const response = await axios.get('/api/register/patient/daily', {
            params: {
                startDate: startDate,
                endDate: endDate
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const { data } = response.data

        const tableBody = document.getElementById('table-body')
        tableBody.innerHTML = '' // Clear previous data
        data.forEach((item, index) => {
            const arrTanggal = item.tanggal.split('-')
            const row = document.createElement('tr')
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${arrTanggal[0]}</td>
                <td>${bulan[Number(arrTanggal[1]) - 1]}</td>
                <td>${item.tanggal}</td>
                <td>${item.nama}</td>
                <td>Rp ${item.total.toLocaleString('id-ID')}</td>
            `
            tableBody.appendChild(row)
        })
        const row = document.createElement('tr')
        row.innerHTML = `
            <td colspan="5" class="text-center">Total</td>
            <td>Rp ${data.reduce((acc, item) => acc + item.total, 0).toLocaleString('id-ID')}</td>
        `
        tableBody.appendChild(row)
    } catch (error) {
        const tableBody = document.getElementById('table-body')
        tableBody.innerHTML = '' // Clear previous data
        const row = document.createElement('tr')
        row.innerHTML = `
            <td colspan="8" class="text-center">Data tidak ditemukan</td>
        `
        tableBody.appendChild(row)
        console.error('Error fetching data:', error)
    }
}

const fetchUsers = async () => {
    const searchQuery = document.getElementById('input-search').value.trim()
    try {
        const response = await axios.get('/api/users', {
            params: {
                search: searchQuery
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const { data } = response.data

        const tableBody = document.getElementById('table-body')
        tableBody.innerHTML = '' // Clear previous data
        data.forEach((item) => {
            const isCurrentUser = Number(localStorage.getItem('id')) === item.id
            const row = document.createElement('tr')
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.user}</td>
                <td>${item.name}</td>
                <td>${item.role}</td>
                <td><button class="btn btn-primary" onclick="editUser('${item.id}')">Edit</button>
                ${!isCurrentUser ? `<button class="btn btn-danger" onclick="deleteUser('${item.id}')">Delete</button>` : ''}
            `
            tableBody.appendChild(row)
        })
    } catch (error) {
        console.error('Error fetching users:', error)
        alert('Error fetching users. Please try again later.')
    }
}

const deleteUser = async (id) => {
    try {
        const confirmDelete = confirm("Apakah Anda yakin ingin menghapus user ini?");
        if (confirmDelete) {
            await axios.delete('/api/users/' + id, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchUsers()
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Gagal menghapus user. Silakan coba lagi.');
    }
}

const addUser = async () => {
    const user = document.getElementById('user').value.trim()
    const name = document.getElementById('name').value.trim()
    const password = document.getElementById('password').value.trim()
    const role = document.getElementById('role').value.trim()

    if (!user || !name || !password || !role) {
        alert('User, Name, Role, and Password are required.')
        return
    }

    try {
        await axios.post('/api/users', {
            user: user,
            name: name,
            password: password,
            role: role
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        clearForm();
        location.href = '/admin/users';
    } catch (error) {
        console.error('Error adding user:', error);
        alert('Gagal menambahkan user. Silakan coba lagi.');
    }
}

const editUser = id => {
    window.location = '/admin/users/edit/' + id
}

const changeUser = async id => {
    const user = document.getElementById('user').value.trim()
    const name = document.getElementById('name').value.trim()
    const role = document.getElementById('role').value.trim()
    const password = document.getElementById('password').value.trim()

    if (!user || !name || !role) {
        alert('User, Name, and Role are required.')
        return
    }

    try {
        await axios.put('/api/users/' + id,
            {
                user: user,
                name: name,
                role: role,
                password: password || undefined // Password is optional
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        clearForm();
        location.href = '/admin/users';
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Gagal mengubah password. Silakan coba lagi.');

    }
}

const changePassword = async () => {
    const oldPassword = document.getElementById('oldPassword').value.trim()
    const newPassword = document.getElementById('newPassword').value.trim()

    if (!oldPassword || !newPassword) {
        alert('Old Password and New Password are required.')
        return
    }

    try {
        await axios.put('/api/users/auth/password', {
            oldPassword: oldPassword,
            newPassword: newPassword
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        alert('Password changed successfully.')
        clearForm()
        location.href = '/admin'
    } catch (error) {
        console.error('Error changing password:', error)
        alert('Gagal mengubah password. Silakan coba lagi.')
    }
}