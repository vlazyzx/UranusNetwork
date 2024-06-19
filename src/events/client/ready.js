module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
      // Event "ready" akan dipanggil sekali saat bot berhasil login ke Discord.
      // Pada event ini, kita mencetak pesan ke konsol yang menunjukkan bot sudah siap digunakan.
        setInterval(client.pickPresence, 10 * 1000);
        console.log(`${client.user.tag} has logged into Discord!`);
    },
  };
  