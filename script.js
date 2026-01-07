/* ===============================
   LOAD HEADER OTOMATIS
================================ */
fetch("header.html")
    .then(res => res.text())
    .then(html => {
        const header = document.getElementById("header");
        if (header) header.innerHTML = html;
    });

/* ===============================
   PROTEKSI WAJIB LOGIN
================================ */
const userLogin = JSON.parse(localStorage.getItem("userLogin"));

const halamanDilindungi = [
    "peminjaman.html",
    "transaksi.html",
    "rekap.html"
];

const halamanAktif = location.pathname.split("/").pop();

if (halamanDilindungi.includes(halamanAktif) && !userLogin) {
    alert("⚠️ Silakan login terlebih dahulu!");
    location.href = "login.html";
}

/* ===============================
   AUTOFILL NIM & NAMA
================================ */
document.addEventListener("DOMContentLoaded", () => {
    if (!userLogin) return;

    // Autofill
    const nim = document.getElementById("nim");
    const nama = document.getElementById("nama");

    if (nim) {
        nim.value = userLogin.nim;
        nim.readOnly = true;
    }

    if (nama) {
        nama.value = userLogin.nama;
        nama.readOnly = true;
    }

    // Tampilkan data jika di halaman rekap
    tampilkanDaftarPeminjam();
    tampilkanRekap();
});


/* ===============================
   DATA PEMINJAMAN
================================ */
let dataPeminjaman =
    JSON.parse(localStorage.getItem("dataPeminjaman")) || [];

/* ===============================
   WAKTU REALTIME
================================ */
function updateWaktu() {
    const now = new Date();
    const waktuStr =
        now.toLocaleDateString("id-ID") + " " +
        now.toLocaleTimeString("id-ID");

    const waktu = document.getElementById("waktu");
    if (waktu) waktu.value = waktuStr;
}

setInterval(updateWaktu, 1000);
updateWaktu();

/* ===============================
   NOMOR TRANSAKSI OTOMATIS
================================ */
function generateNoTransaksi() {
    let counter = localStorage.getItem("counterTrx") || 0;
    counter++;
    localStorage.setItem("counterTrx", counter);

    return `TRX-${new Date().getFullYear()}-${counter
        .toString()
        .padStart(4, "0")}`;
}

/* ===============================
   SIMPAN PEMINJAMAN
================================ */
const form = document.getElementById("formTransaksi");

if (form) {
    form.addEventListener("submit", e => {
        e.preventDefault();

        const nim = document.getElementById("nim");
        const nama = document.getElementById("nama");
        const jurusan = document.getElementById("jurusan");
        const semester = document.getElementById("semester");
        const buku = document.getElementById("buku");
        const waktu = document.getElementById("waktu");
        const error = document.getElementById("error");
        const success = document.getElementById("success");

        const transaksi = {
            no: generateNoTransaksi(),
            nim: nim.value,
            nama: nama.value,
            jurusan: jurusan.value,
            semester: semester.value,
            buku: buku.value,
            waktu: waktu.value
        };

        if (!jurusan.value || !semester.value || !buku.value) {
            error.innerText = "⚠️ Semua data wajib diisi!";
            success.innerText = "";
            return;
        }

        dataPeminjaman.push(transaksi);
        localStorage.setItem(
            "dataPeminjaman",
            JSON.stringify(dataPeminjaman)
        );

        error.innerText = "";
        success.innerText = "✅ Data berhasil direkap!";

        form.reset();
        updateWaktu();

        nim.value = userLogin.nim;
        nama.value = userLogin.nama;

        tampilkanDaftarPeminjam();
        tampilkanRekap();

        setTimeout(() => success.innerText = "", 3000);
    });
}


/* ===============================
   TAMPILKAN REKAP
================================ */
function tampilkanRekap() {
    const tbody = document.getElementById("tabelRekap");
    if (!tbody) return;

    const rekap = {};

    dataPeminjaman.forEach(d => {
        const key = `${d.jurusan}|${d.semester}`;
        rekap[key] = (rekap[key] || 0) + 1;
    });

    tbody.innerHTML = "";

    Object.keys(rekap).forEach(key => {
        const [jurusan, semester] = key.split("|");
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${jurusan}</td>
            <td>${semester}</td>
            <td>${rekap[key]}</td>
        `;

        tbody.appendChild(tr);
    });

    updateGrafik(rekap);
}

/* ===============================
   GRAFIK PIE & LINE
================================ */
let chart;

function updateGrafik(rekap) {
    const canvas = document.getElementById("rekapChart");
    if (!canvas || typeof Chart === "undefined") return;

    const labels = [];
    const values = [];

    Object.keys(rekap).forEach(k => {
        labels.push(k.replace("|", " - Semester "));
        values.push(rekap[k]);
    });

    if (chart) chart.destroy();

    chart = new Chart(canvas, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data: values
            }]
        },
        options: {
            responsive: true
        }
    });
}

/* ===============================
   TAMPILKAN DAFTAR PEMINJAM
================================ */
function tampilkanDaftarPeminjam() {
    const tbody = document.getElementById("tabelDaftarPeminjam");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (dataPeminjaman.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    Belum ada data peminjaman
                </td>
            </tr>
        `;
        return;
    }

    dataPeminjaman.forEach((d, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${d.no}</td>
            <td>${d.nim}</td>
            <td>${d.nama}</td>
            <td>${d.jurusan}</td>
            <td>${d.semester}</td>
            <td>${d.buku}</td>
            <td>${d.waktu}</td>
        `;
        tbody.appendChild(tr);
    });
}