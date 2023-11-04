<h1 align="center">
 rota-api
</h1>

Kullanıcıların belirledikleri konuma ve bütçeye göre özel seyahat rotaları oluşturabilecekleri, her türlü seyahat deneyimini içeren kapsamlı bir web uygulamasıdır. Bu platform, gezginlere yeme-içme yerlerinden gezilecek yerlere, tarihi ve kültürel mekanlardan alışveriş noktalarına ve eğlence-spor aktivitelerine kadar her şeyi içeren seyahat deneyimleri sunar.

> :warning: Lütfen yeni bir `branch` oluşturduktan sonra projede değişiklik yapınız. Değişiklik yaptığınız dosyalarda kod formatına uymayan yani altı kızarılı satırların bulunmadığından emin olunuz. Kodu formatlamak için dosyayı kaydedip kodu formatlayabilirsiniz Değişiklikleri `git`'e attıktan sonra `pull request` açabilirsiniz.

## Menu

- [Başlamadan Önce](#başlamadan-önce)
- [Linter Kullanımı](#linter-kullanımı)
- [Dosya Yapısı](#dosya-yapısı)
- [Kullanımlar](#kullanımlar)
- [Katkıda Bulunanlar](#katkıda-bulunanlar)
- [Lisans](#lisans)

## Başlamadan Önce

### İndirme

```bash
git clone https://github.com/create-travel-route/rota-api
cd rota-api
```

### Kurulum

```bash
npm install
```

### Ortam Değişkenlerini Ayarlama

```bash
cp sample.env .env
```

## Çalıştır
### Üretim Aşaması
```bash
npm start
```
### Geliştirme
Hotreload kullanarak geliştirme

```bash
npm run start:dev
```
## Lint
```bash
npm run lint
```
**Lint hatalarını çözmek için**:
```bash
npm run lint:fix
```
## Build Alma
```bash
npm run build
```

## Linter Kullanımı

ESLint ve Prettier - Code formatter uzantılarını VSCode'a ekleyiniz. Ayarlar ikonundan `Settings > Settings.json` dosyasına alttaki kodu ekleyiniz. Kod eklendikten sonra kuraldışı kullanımların altı kızaracak. Sayfayı kaydederseniz kod otomatik olarak formatlanacaktır.

```json
{
  "eslint.validate": ["javascript"],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnPaste": true
}
```

## Dosya Yapısı

```
.
├── LICENSE
├── README.md
├── nodemon.json
├── package-lock.json
├── package.json
├── sample.env
└── src
    ├── Constants
    ├── Exceptions
    ├── Middlewares
    ├── Models
    ├── Routes
    ├── Services
    ├── Utils
    └── server.js
```

## Kullanımlar

| Klasörler   | Açıklama                                                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Constants   | Sabit değişkenler için bu klasörde dosya oluşturabilirsiniz.                                                                     |
| Exceptions  |                                                                                                                                  |
| Middlewares | Ara yazılımları burada oluşturabilirsiniz                                                                                        |
| Models      | Modeller bu klasörde olmalıdır. `index` dosyasında tanımlamayı unutmayınız.                                                      |
| Routes      | Rotalar bu klasörde olmalıdır. `rotaİsmi/index.jsx` şeklinde oluşturunuz. `Routes/index.js` dosyasında tanımlamayı unutmayınız. |
| Services    | Servisler bu klasörde olmalıdır. `servisİsmi/index.jsx` şeklinde oluşturunuz.                                                       |
| Utils       | Bu klasörü projede birden fazla yerde kullanılacak işlevler için kullanabilirsiniz.                                              |

## Katkıda Bulunanlar

<a href = "https://github.com/create-travel-route/rota-api/graphs/contributors">
  <img src = "https://contrib.rocks/image?repo=create-travel-route/rota-api"/>
</a>

## Lisans

[GNU GENERAL PUBLIC LICENSE Version 3](./LICENSE)
