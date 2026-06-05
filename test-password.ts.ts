import { compare } from "bcryptjs";

async function test() {
  // Veritabanındaki hash'ler
  const adminHash = "$2b$12$pN4A76YTTQcJf1vWgKKjWOX.rUBRTarlLOgdelNpL9zCeB6Rv9UT6";
  const testHash = "$2b$12$kMvgMzgCiq5aENO0dMgeHeAaTYYi.RPrRwSiKSm5EU.qINyWeNXKS";
  
  // Şifreleri dene
  console.log("Admin şifre 'admin123' doğru mu?", await compare("admin123", adminHash));
  console.log("Test şifre '123456789' doğru mu?", await compare("123456789", testHash));
  
  // Yanlış şifre dene
  console.log("Yanlış şifre test:", await compare("wrong", adminHash));
}

test();