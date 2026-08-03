const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content')

if (csrfToken) {
    axios.defaults.headers.common['CSRF-Token'] = csrfToken
}
const getCurrentDateInWIB = () => new Date().toLocaleDateString('sv-SE')

const token = localStorage.getItem('accessToken')
let startDate = getCurrentDateInWIB()
let endDate = getCurrentDateInWIB()
let currentPage = 1
const limit = 10
let listData = []
const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
let mode = 'add'
let selectedTanggal = null
let modal
let debounceTimer = null
let currentController = null

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

axios.interceptors.request.use(function (config) {

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

axios.interceptors.response.use(
    function (response) {
        return response
    },
    function (error) {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.replace("/admin/login")
        }

        return Promise.reject(error)
    }
)

const fetchData = async (page = 1) => {
    try {
        const response = await axios.get('/api/register', {
            params: {
                page: page,
                limit: limit,
                startDate: startDate,
                endDate: endDate
            }
        })

        const { data, pagination } = response.data
        listData = data
        const tableBody = document.getElementById('table-body')
        tableBody.innerHTML = '' // Clear previous data

        if (!data || data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="12" class="text-center">No Data Available.</td>
                </tr>
            `
            return
        }

        data.forEach((item, index) => {
            const age = getAge(item.tgl_lahir)
            const jenisKelamin = item.jk === 'L' ? 'Laki-laki' : item.jk === 'P' ? 'Perempuan' : 'Tidak diketahui';
            const row = document.createElement('tr')
            row.innerHTML = `
                <td>${(pagination.page - 1) * limit + index + 1}</td>
                <td>${item.no_rkm_medis}</td>
                <td>${item.nama}</td>
                <td>${item.nik}</td>
                <td>${jenisKelamin}</td>
                <td>${item.tgl_lahir.split('T')[0]} / ${age} Th</td>
                <td>${item.alamat}</td>
                <td>${item.nohp}</td>
                <td>${item.no_reg}</td>
                <td>${item.tanggal.split('T')[0]}</td>
                <td>${item.start_time.slice(0, 5)}-${item.end_time.slice(0, 5)}</td>
                <td>${item.keluhan}</td>
                <td><button class="btn btn-primary" onclick="editRegister('${item.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteRegister('${item.id}')">Delete</button>
                <button class="btn btn-info" onclick="sendMessage('${item.id}')">Whatsapp</button>
                ${item.total ? `<button class="btn btn-success" onclick="printRegister('${item.id}')">Print</button>` : ''}
                <button class="btn btn-warning" onclick="printQueue('${item.id}')">Antrian</button>
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
    paginationElement.innerHTML = ''

    const range = 2 // jumlah halaman di kiri/kanan

    const createPageItem = (p, label = p, active = false, disabled = false) => {
        const li = document.createElement('li')
        li.classList.add('page-item')
        if (active) li.classList.add('active')
        if (disabled) li.classList.add('disabled')

        const a = document.createElement('a')
        a.classList.add('page-link')
        a.href = '#'
        a.textContent = label

        if (!active && !disabled) {
            a.onclick = () => fetchData(p)
        } else {
            a.style.pointerEvents = 'none'
        }

        li.appendChild(a)
        return li
    }

    // Prev
    paginationElement.appendChild(
        createPageItem(page - 1, '«', false, page === 1)
    )

    let start = Math.max(1, page - range)
    let end = Math.min(totalPage, page + range)

    // First + ...
    if (start > 1) {
        paginationElement.appendChild(createPageItem(1))
        if (start > 2) {
            paginationElement.appendChild(createPageItem(null, '...', false, true))
        }
    }

    // Middle pages
    for (let i = start; i <= end; i++) {
        paginationElement.appendChild(
            createPageItem(i, i, i === page)
        )
    }

    // ... + Last
    if (end < totalPage) {
        if (end < totalPage - 1) {
            paginationElement.appendChild(createPageItem(null, '...', false, true))
        }
        paginationElement.appendChild(createPageItem(totalPage))
    }

    // Next
    paginationElement.appendChild(
        createPageItem(page + 1, '»', false, page === totalPage)
    )
}

const updatePatientPagination = (page, totalPage) => {
    const paginationElement = document.getElementById('pagination')
    paginationElement.innerHTML = ''

    const range = 2 // jumlah halaman di kiri/kanan

    const createPageItem = (p, label = p, active = false, disabled = false) => {
        const li = document.createElement('li')
        li.classList.add('page-item')
        if (active) li.classList.add('active')
        if (disabled) li.classList.add('disabled')

        const a = document.createElement('a')
        a.classList.add('page-link')
        a.href = '#'
        a.textContent = label

        if (!active && !disabled) {
            a.onclick = () => fetchSearchPatient(p)
        } else {
            a.style.pointerEvents = 'none'
        }

        li.appendChild(a)
        return li
    }

    // Prev
    paginationElement.appendChild(
        createPageItem(page - 1, '«', false, page === 1)
    )

    let start = Math.max(1, page - range)
    let end = Math.min(totalPage, page + range)

    // First + ...
    if (start > 1) {
        paginationElement.appendChild(createPageItem(1))
        if (start > 2) {
            paginationElement.appendChild(createPageItem(null, '...', false, true))
        }
    }

    // Middle pages
    for (let i = start; i <= end; i++) {
        paginationElement.appendChild(
            createPageItem(i, i, i === page)
        )
    }

    // ... + Last
    if (end < totalPage) {
        if (end < totalPage - 1) {
            paginationElement.appendChild(createPageItem(null, '...', false, true))
        }
        paginationElement.appendChild(createPageItem(totalPage))
    }

    // Next
    paginationElement.appendChild(
        createPageItem(page + 1, '»', false, page === totalPage)
    )
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
            await axios.post('/api/users/auth/logout')
        } catch (error) {
            console.error('Error during logout:', error)
            alert('Gagal keluar. Silakan coba lagi.')
            return;
        }

        localStorage.clear();

        window.location.href = "/admin/login"
    }
}

const today = () => {
    const input = document.getElementById('tanggal-periksa')

    input.value = getCurrentDateInWIB()
    input.dispatchEvent(new Event('change'))
}

const clearForm = () => {
    document.getElementById('add-data-form').reset()
}

const insertPatientData = async () => {
    const data = {
        nama: document.getElementById('name').value.trim(),
        nik: document.getElementById('nik').value.trim(),
        alamat: document.getElementById('alamat').value.trim(),
        nohp: document.getElementById('telepon').value.trim(),
        tglLahir: document.getElementById('tanggal-lahir').value,
        jk: document.getElementById('jenis-kelamin').value
    }

    try {
        await axios.post('/api/patient', data)

        clearForm();

        window.location = '/admin/patient'
    } catch (error) {
        console.error('Error submitting form:', error)

        if (error.response) {
            const status = error.response.status
            const message = error.response.data?.message || 'Terjadi kesalahan dari server'

            alert(`Error ${status}: ${message}`)

        } else if (error.request) {
            alert('Server tidak merespon. Periksa koneksi atau server.')

        } else {
            alert(`Error: ${error.message}`)
        }
    }
}

const insertData = async () => {
    const data = {
        no_rkm_medis: document.getElementById('no_rkm_medis').value,
        tanggalDaftar: document.getElementById('tanggal-periksa').value,
        schedule: Number(document.querySelector('input[name="queue_session_id"]:checked')?.value),
        keluhan: document.getElementById('keluhan').value.trim(),
        diagnosa: document.getElementById('diagnosa').value.trim(),
        tindakan: document.getElementById('tindakan').value.trim(),
        obat: document.getElementById('obat').value.trim(),
        total: document.getElementById('biaya').value.replace(/[^\d]/g, '')
    };

    try {
        await axios.post('/api/register/complete', data);

        clearForm();

        window.location = '/admin/'
    } catch (error) {
        console.error('Error submitting form:', error)

        if (error.response) {
            const status = error.response.status
            const message = error.response.data?.message || 'Terjadi kesalahan dari server'

            alert(`Error ${status}: ${message}`)

        } else if (error.request) {
            alert('Server tidak merespon. Periksa koneksi atau server.')

        } else {
            alert(`Error: ${error.message}`)
        }
    }
}

const editRegister = registerId => {
    window.location = '/admin/register/edit/' + registerId
}

const editPatient = patientId => {
    window.location = '/admin/patient/edit/' + patientId
}

const updateData = async (id) => {
    const data = {
        tanggalDaftar: document.getElementById('tanggal-periksa').value,
        keluhan: document.getElementById('keluhan').value.trim(),
        diagnosa: document.getElementById('diagnosa').value.trim(),
        tindakan: document.getElementById('tindakan').value.trim(),
        obat: document.getElementById('obat').value.trim(),
        total: document.getElementById('biaya').value.replace(/[^\d]/g, '')
    };

    try {
        await axios.put('/api/register/' + id, data);

        clearForm();

        window.location = '/admin/'
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Gagal menyimpan data. Silakan coba lagi.');
    }
}

const updatePatientData = async (id) => {
    const data = {
        nama: document.getElementById('name').value.trim(),
        nik: document.getElementById('nik').value.trim(),
        alamat: document.getElementById('alamat').value.trim(),
        nohp: document.getElementById('telepon').value.trim(),
        tglLahir: document.getElementById('tanggal-lahir').value,
        jk: document.getElementById('jenis-kelamin').value
    }

    try {
        await axios.put('/api/patient/' + id, data);

        clearForm();

        alert('Berhasil mengubah data pasien.');
        window.location = '/admin/patient'
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Gagal menyimpan data. Silakan coba lagi.');
    }
}

const deleteRegister = async (id) => {
    try {
        const confirmDelete = confirm("Apakah Anda yakin ingin menghapus data ini?");
        if (confirmDelete) {
            await axios.delete('/api/register/' + id)
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
            <div>Jl. Gajah Mada Gg. Kasuari No. 15 Bogoran, Kauman, Batang</div>
            <div>Telp: 0823-1454-1887</div>
            <div class="line"></div>
            <strong>INVOICE</strong>
            <div>${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
        </div>
        <div class="line"></div>
        <table>
            <tr><td class="label">Nama</td><td>:</td><td class="value">${item.nama}</td></tr>
            <tr><td class="label">No. RM</td><td>:</td><td class="value">${item.no_rkm_medis}</td></tr>
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

const printQueue = id => {

    const item = listData.find(item => item.id === id)
    if (!item) {
        alert('Data tidak ditemukan')
        return
    }

    const win = window.open('', '_blank')
    if (!win) {
        alert('Popup diblokir. Harap izinkan popup di browser Anda.')
        return
    }

    const style = `
        body {
            font-family: monospace;
            font-size: 12px;
            width: 80mm;
            padding: 5px;
        }
        .center { text-align: center; }
        .big {
            font-size: 38px;
            font-weight: bold;
            margin: 10px 0;
        }
        .line {
            border-top: 1px dashed #000;
            margin: 6px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td {
            padding: 2px 0;
            vertical-align: top;
        }
        .label { width: 40%; }
        .value { width: 60%; }
    `

    // format tanggal dari item
    const tgl = new Date(item.tanggal)
    const tanggal = tgl.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })

    const keluhan = (item.keluhan || '-').replace(/\n/g, '<br>')

    const html = `
        <div class="center">
            <h3>Rumah Dental Gama</h3>
            <div>Jl. Gajah Mada Gg. Kasuari No. 15 Bogoran, Kauman, Batang</div>
            <div>Telp: 0823-1454-1887</div>
        </div>

        <div class="line"></div>

        <div class="center">
            <div>Nomor Antrian</div>
            <div class="big">${item.no_reg || '-'}</div>
        </div>

        <div class="line"></div>

        <table>
            <tr><td class="label">Nama</td><td>:</td><td class="value">${item.nama}</td></tr>
            <tr><td class="label">No RM</td><td>:</td><td class="value">${item.no_rkm_medis}</td></tr>
            <tr><td class="label">Tgl Lahir</td><td>:</td><td class="value">${item.tgl_lahir}</td></tr>
            <tr><td class="label">JK</td><td>:</td><td class="value">${item.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</td></tr>
            <tr><td class="label">Alamat</td><td>:</td><td class="value">${item.alamat}</td></tr>
            <tr><td class="label">Tanggal Periksa</td><td>:</td><td class="value">${tanggal}</td></tr>
        </table>

        <div class="line"></div>

        <div class="center">
            Harap menunggu panggilan<br>
            sesuai nomor antrian
        </div>

        <div class="line"></div>

        <div class="center">-- Terima Kasih --</div>
    `

    const wait = () => {
        if (win.document.readyState === 'complete') {
            const doc = win.document
            doc.head.innerHTML = ''
            doc.body.innerHTML = ''

            const styleEl = doc.createElement('style')
            styleEl.textContent = style
            doc.head.appendChild(styleEl)

            doc.body.innerHTML = html

            win.focus()
            win.print()
            win.onafterprint = () => win.close()
        } else {
            setTimeout(wait, 50)
        }
    }

    wait()
}

const searchPatient = async () => {
    const nik = document.getElementById('nik').value.trim()
    if (nik.length < 16) {
        alert('NIK tidak valid')
        return
    }

    try {
        const response = await axios.get('/api/register/patient/' + nik)

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
        const response = await axios.get('/api/register/finance/' + selectedYear)

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
        const response = await axios.get('/api/register/finance/monthly', {
            params: {
                year: selectedYear,
                month: selectedMonth
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

const fetchSearchRegister = async () => {
    const query = document.getElementById('input-search').value.trim()

    if (query.length < 3) {
        alert('Minimal 3 karakter')
        return
    }

    try {
        const response = await axios.get('/api/register/search', {
            params: {
                query: query
            }
        })

        const { data } = response.data

        const tableBody = document.getElementById('table-body')
        tableBody.innerHTML = '' // Clear previous data

        if (!data || data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="16" class="text-center">No Data Available.</td>
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
                <td>${item.no_rkm_medis}</td>
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
                <button class="btn btn-danger" onclick="deleteRegister('${item.id}')">Delete</button></td>
            `
            tableBody.appendChild(row)
        })
    } catch (error) {
        console.error('Error fetching data:', error)
        alert('Error fetching data. Please try again later.')
    }
}

const fetchSearchPatient = async (page = 1) => {
    const query = document.getElementById('input-search').value.trim()

    try {
        const response = await axios.get('/api/patient', {
            params: {
                keyword: query,
                page: page,
                limit: limit
            }
        })

        const { data, pagination } = response.data

        const tableBody = document.getElementById('table-body')
        tableBody.innerHTML = '' // Clear previous data

        if (!data || data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center">No Data Available.</td>
                </tr>
            `
            return
        }

        data.forEach((item, index) => {
            const age = getAge(item.tgl_lahir)
            const jenisKelamin = item.jk === 'L' ? 'Laki-laki' : item.jk === 'P' ? 'Perempuan' : 'Tidak diketahui';
            const row = document.createElement('tr')
            row.innerHTML = `
                <td>${(pagination.page - 1) * limit + index + 1}</td>
                <td>${item.no_rkm_medis}</td>
                <td>${item.nama}</td>
                <td>${item.nik}</td>
                <td>${jenisKelamin}</td>
                <td>${item.tgl_lahir.split('T')[0]} / ${age} Th</td>
                <td>${item.alamat}</td>
                <td>${item.nohp}</td>
                <td>
                    <button class="btn btn-primary" onclick="editPatient('${item.no_rkm_medis}')">Edit</button>
                    <button class="btn btn-success" onclick="mergePatient('${item.no_rkm_medis}', '${item.nama}')">Gabung</button>
                </td>
            `
            tableBody.appendChild(row)
        })

        const paginationElement = document.getElementById('pagination')
        paginationElement.innerHTML = '' // Clear previous pagination


        currentPage = pagination.page
        const pageInfo = document.getElementById('page-info')
        pageInfo.innerHTML = `Page ${pagination.page} of ${pagination.totalPage}`
        updatePatientPagination(pagination.page, pagination.totalPage)
    } catch (error) {
        console.error('Error fetching data:', error)
        alert('Error fetching data. Please try again later.')
    }
}

const fetchPatientDailyReport = async () => {
    try {
        const response = await axios.get('/api/register/finance/daily', {
            params: {
                startDate: startDate,
                endDate: endDate
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
            await axios.delete('/api/users/' + id)
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
        });

        clearForm();
        location.href = '/admin/users';
    } catch (error) {
        console.error('Error submitting form:', error)

        if (error.response) {
            const status = error.response.status
            const message = error.response.data?.message || 'Terjadi kesalahan dari server'

            alert(`Error ${status}: ${message}`)

        } else if (error.request) {
            alert('Server tidak merespon. Periksa koneksi atau server.')

        } else {
            alert(`Error: ${error.message}`)
        }
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
        })

        alert('Password changed successfully.')
        clearForm()
        location.href = '/admin'
    } catch (error) {
        console.error('Error changing password:', error)
        alert('Gagal mengubah password. Silakan coba lagi.')
    }
}

const sendMessage = async (id) => {
    try {
        await axios.post('/api/register/notif/' + id)
        alert('Pesan WhatsApp berhasil dikirim.')
    } catch (error) {
        console.error('Error sending WhatsApp message:', error)
        alert('Gagal mengirim pesan WhatsApp. Silakan coba lagi.')
    }
}

const fetchHolidays = async (page = 1) => {
    const searchQuery = document.getElementById('input-search').value.trim()
    try {
        const response = await axios.get('/api/holiday', {
            params: {
                page: page,
                limit: limit,
                search: searchQuery
            }
        })

        const { data, pagination } = response.data

        const tableBody = document.getElementById('table-body')
        tableBody.innerHTML = '' // Clear previous data

        data.forEach((item) => {
            const row = document.createElement('tr')
            row.innerHTML = `
                <td>${formatTanggalIndo(item.tanggal)}</td>
                <td>${item.keterangan}</td>
                <td><button class="btn btn-primary" onclick="editHoliday('${item.tanggal}', '${item.keterangan}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteHoliday('${item.tanggal}')">Delete</button>
            `
            tableBody.appendChild(row)
        })

        const paginationElement = document.getElementById('pagination')
        paginationElement.innerHTML = '' // Clear previous pagination


        currentPage = pagination.page
        const pageInfo = document.getElementById('page-info')
        pageInfo.innerHTML = `Page ${pagination.page} of ${pagination.totalPage}`
        updateHolidayPagination(pagination.page, pagination.totalPage)
    } catch (error) {
        console.error('Error fetching holidays:', error)
        alert('Error fetching holidays. Please try again later.')
    }
}

const deleteHoliday = async (date) => {
    try {
        const confirmDelete = confirm("Apakah Anda yakin ingin menghapus tanggal ini?");
        if (confirmDelete) {
            await axios.delete('/api/holiday/' + date)
            fetchHolidays()
        }
    } catch (error) {
        console.error('Error deleting holiday: ', error);
        alert('Gagal menghapus holiday. Silakan coba lagi.');
    }
}

const editHoliday = async (tanggal, keterangan) => {
    mode = 'edit'
    selectedTanggal = tanggal
    document.getElementById('modalTitle').innerText = 'Edit Hari Tutup'
    document.getElementById('tanggal').value = tanggal
    document.getElementById('keterangan').value = keterangan
    document.getElementById('tanggal').disabled = true
    modal.show()
}

const submitHoliday = async () => {
    const data = {
        tanggal: document.getElementById('tanggal').value,
        keterangan: document.getElementById('keterangan').value
    }

    try {
        if (mode === 'add') {
            await axios.post('/api/holiday/', data)
        } else {
            await axios.put(`/api/holiday/${selectedTanggal}`, {
                keterangan: data.keterangan
            })
        }
    } catch (error) {
        console.error('Error submit holiday: ', error);
        alert('Gagal submit holiday. Silakan coba lagi.');
    }
}

const formatTanggalIndo = (dateStr) => {
    const date = new Date(dateStr)

    const formatted = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(date)

    return `${dateStr} (${formatted})`
}

const updateHolidayPagination = (page, totalPage) => {
    const paginationElement = document.getElementById('pagination')
    paginationElement.innerHTML = `
    <li class="page-item ${page === 1 ? 'disabled' : ''}">
        <a id="prev-page" class="page-link" href="#" onclick="fetchHolidays(${page - 1})">&laquo;</a>
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
            a.setAttribute('onclick', `fetchHolidays(${i})`)
        }

        li.appendChild(a)
        paginationElement.appendChild(li)
    }

    paginationElement.innerHTML += `
    <li class="page-item ${page === totalPage ? 'disabled' : ''}">
        <a id="next-page" class="page-link" href="#" onclick="fetchHolidays(${page + 1})">&raquo;</a>
    </li>
    `
}

function openModalPasien() {
    modal.show()
    fetchPasien('')
}

async function fetchPasien(keyword) {
    const tbody = document.getElementById('result-pasien')

    try {
        // abort request sebelumnya
        if (currentController) {
            currentController.abort()
        }

        // buat controller BARU (lokal)
        const controller = new AbortController()
        currentController = controller

        // loading UI
        tbody.innerHTML = `<tr><td colspan="8" class="text-center">Loading...</td></tr>`

        const res = await axios.get('/api/patient/search', {
            params: { keyword },
            signal: currentController.signal
        })

        // ❗ penting: pastikan ini request terakhir
        if (controller !== currentController) return

        renderPasien(res.data.data)

    } catch (err) {
        // kalau di-cancel → skip
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return

        console.error(err)
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Terjadi kesalahan</td></tr>`
    }
}

// render table
function renderPasien(list) {
    const tbody = document.getElementById('result-pasien')

    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center">Tidak ditemukan</td></tr>`
        return
    }

    tbody.innerHTML = list.map(p => `
        <tr>
            <td>
                <button class="btn btn-sm btn-primary" onclick='selectPasien(${JSON.stringify(p)})'>
                    Pilih
                </button>
            </td>
            <td>${p.no_rkm_medis}</td>
            <td>${p.nama}</td>
            <td>${p.nik}</td>
            <td>${p.jk}</td>
            <td>${p.tgl_lahir}</td>
            <td>${p.nohp}</td>
            <td>${p.alamat}</td>
        </tr>
    `).join('')
}

// isi form
function selectPasien(p) {
    document.getElementById('no_rkm_medis').value = p.no_rkm_medis
    document.getElementById('name').value = p.nama
    document.getElementById('nik').value = p.nik
    document.getElementById('alamat').value = p.alamat
    document.getElementById('telepon').value = p.nohp
    document.getElementById('tanggal-lahir').value = p.tgl_lahir
    document.getElementById('jenis-kelamin').value =
        p.jk === 'L' ? 'Laki-laki' : 'Perempuan'

    modal.hide()
}

function mergePatient(no_rm, nama) {

    document.getElementById('merge-source-rm').value = no_rm
    document.getElementById('merge-source-nama').value = nama

    document.getElementById('merge-target-rm').value = ''
    document.getElementById('target-info').style.display = 'none'

    document.getElementById('target-nama').value = ''
    document.getElementById('target-nik').value = ''
    document.getElementById('target-tgl').value = ''
    document.getElementById('target-jk').value = ''
    document.getElementById('target-alamat').value = ''

    const modalEl = document.getElementById('modal-merge')

    if (!modal) {
        modal = new bootstrap.Modal(modalEl)
    }

    modal.show()
}

const checkTargetPatient = async (noRM) => {
    if (!noRM) {
        alert('Masukkan No.RM tujuan')
        return
    }

    try {
        const { data } = await axios.get(`/api/patient/${noRM}`)

        if (!data.data || !data.data.no_rkm_medis) {
            alert('Data tidak ditemukan')
            return
        }

        document.getElementById('target-nama').value = data.data.nama
        document.getElementById('target-nik').value = data.data.nik
        document.getElementById('target-tgl').value = data.data.tgl_lahir
        document.getElementById('target-jk').value = (data.data.jk === 'L') ? 'Laki-laki' : 'Perempuan'
        document.getElementById('target-alamat').value = data.data.alamat

        document.getElementById('target-info').style.display = 'block'
    } catch (error) {
        console.error(err)
        alert(err.response?.data?.message || 'Gagal mengambil data')
    }
}

const doMergePatient = async (sourceRM, targetRM) => {
    try {
        const { data } = await axios.post('/api/patient/merge', {
            sourceRM: sourceRM,
            targetRM: targetRM
        })

        alert('Berhasil gabung No.RM')

        location.reload()
    } catch (error) {
        console.error(err)
        alert(err.response?.data?.message || 'Gagal merge')
    }
}

const loadSchedule = async (date) => {
    try {
        const response = await axios.get(`/api/schedules/active/${date}`);
        const sessions = response.data.data;

        const container = document.getElementById('queueSessionGroup');
        container.innerHTML = '';

        if (!sessions || sessions.length === 0) {
            container.innerHTML = `
                        <div class="alert alert-warning w-100 text-center mb-0">
                            Tidak ada jadwal tersedia pada tanggal yang dipilih.
                        </div>
                    `;
            return;
        }

        sessions.forEach((session, index) => {
            const input = document.createElement('input');
            input.type = 'radio';
            input.className = 'btn-check';
            input.name = 'queue_session_id';
            input.id = `queue-session-${session.id}`;
            input.value = session.id;
            input.autocomplete = 'off';
            input.required = true;

            if (sessions.length === 1) {
                input.checked = true;
            }

            const label = document.createElement('label');
            label.className = 'btn btn-outline-secondary';
            label.htmlFor = input.id;
            label.textContent = `${session.start_time.slice(0, 5)} - ${session.end_time.slice(0, 5)}`;

            container.appendChild(input);
            container.appendChild(label);
        });
    } catch (error) {
        console.error(error);
    }
}

const fetchQueueSessions = async () => {
    try {
        const response = await axios.get('/api/schedules')

        const { data } = response.data

        const tableBody = document.getElementById('table-body')
        tableBody.innerHTML = '' // Clear previous data
        data.forEach((item) => {
            const row = document.createElement('tr')

            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.day_name}</td>
                <td>${item.start_time}</td>
                <td>${item.end_time}</td>
                <td>
                    ${item.status == 1
                    ? '<span class="badge bg-success">Aktif</span>'
                    : '<span class="badge bg-secondary">Nonaktif</span>'
                }
                </td>
                <td>
                    <button 
                        class="btn btn-primary" 
                        onclick="editQueueSession('${item.id}')">
                        Edit
                    </button>

                    ${item.status == 1
                    ?
                    `<button 
                            class="btn btn-danger" 
                            onclick="updateStatusQueueSession('${item.id}', 0)">
                            Deactivate
                        </button>`
                    :
                    `<button 
                            class="btn btn-success" 
                            onclick="updateStatusQueueSession('${item.id}', 1)">
                            Activate
                        </button>`
                }
                </td>
            `

            tableBody.appendChild(row)
        })
    } catch (error) {
        console.error('Error fetching queue session:', error)
        alert('Error fetching queue session. Please try again later.')
    }
}

const addQueueSession = async () => {
    const dayName = document.getElementById('day_name').value.trim()
    const startTime = document.getElementById('start_time').value.trim()
    const endTime = document.getElementById('end_time').value.trim()

    if (!dayName || !startTime || !endTime) {
        alert('nama, jam mulai, dan jam selesai are required.')
        return
    }

    try {
        await axios.post('/api/schedules', {
            dayName: dayName,
            startTime: startTime,
            endTime: endTime
        });

        clearForm();
        location.href = '/admin/queue-session';
    } catch (error) {
        console.error('Error submitting form:', error)

        if (error.response) {
            const status = error.response.status
            const message = error.response.data?.message || 'Terjadi kesalahan dari server'

            alert(`Error ${status}: ${message}`)

        } else if (error.request) {
            alert('Server tidak merespon. Periksa koneksi atau server.')

        } else {
            alert(`Error: ${error.message}`)
        }
    }
}

const editQueueSession = id => {
    window.location = '/admin/queue-session/edit/' + id
}

const changeQueueSession = async id => {
    const dayName = document.getElementById('day_name').value.trim()
    const startTime = document.getElementById('start_time').value.trim()
    const endTime = document.getElementById('end_time').value.trim()

    if (!dayName || !startTime || !endTime) {
        alert('nama, jam mulai, dan jam selesai are required.')
        return
    }

    try {
        await axios.put('/api/schedules/' + id, {
            dayName: dayName,
            startTime: startTime,
            endTime: endTime
        });

        clearForm();
        location.href = '/admin/queue-session';
    } catch (error) {
        console.error('Error changing Queue Session:', error);
        alert('Gagal mengubah Jadwal. Silakan coba lagi.');
    }
}

const updateStatusQueueSession = async (id, status) => {

    if (!confirm('Apakah Anda yakin ingin mengubah status Jadwal ini?')) {
        return;
    }

    try {
        await axios.patch('/api/schedules/' + id, {
            status: status
        });

        location.reload()
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Gagal mengubah password. Silakan coba lagi.');
    }
}

const exportLogbook = async () => {
    try {
        const response = await axios.get('/api/register/export/logbook', {
            params: {
                startDate: startDate,
                endDate: endDate
            },
            responseType: 'blob'
        })

        const disposition = response.headers['content-disposition']

        let fileName = `Logbook_${startDate}_to_${endDate}.xlsx`

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
        try {
            if (error.response?.data instanceof Blob) {
                const text = await error.response.data.text();
                const { message } = JSON.parse(text);
                alert(message);
            } else {
                alert(error.response?.data?.message || error.message);
            }
        } catch {
            alert("Terjadi kesalahan.");
        }
    }
}