FROM node:18

# 1. Uygulama dizini
WORKDIR /app

# 2. package.json kopyala ve bağımlılıkları yükle
COPY package*.json ./
RUN npm install

# 3. Diğer tüm dosyaları kopyala
COPY . .

# 4. Çalışma portunu aç
EXPOSE 5000

# 5. Uygulamayı başlat
CMD ["node", "index.js"]
