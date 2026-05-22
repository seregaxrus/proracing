const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataPath = path.join(root, "data", "landings.json");
const outDir = path.join(root, "landings");
const siteUrl = "http://localhost:4173";

const landings = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const categories = [
  ["moto", "Ремонт мотоциклов", "ТО, диагностика, подвеска, тормоза, электрика, двигатель."],
  ["atv", "Квадроциклы", "Редуктор, вариатор, трансмиссия, охлаждение, тюнинг."],
  ["snow", "Снегоходы", "Сезонное ТО, двигатель, вариатор, подвеска и электрика."],
  ["boat", "Лодочные моторы", "ТО, диагностика, редуктор, охлаждение, электрика, запчасти."],
  ["paint", "Покраска и кастом", "Аэрография, подбор цвета, пластик, сиденья, наклейки."],
  ["extra", "Дополнительные услуги", "Эвакуатор, зимнее хранение, запчасти, аксессуары, ателье."]
];

const serviceGroups = [
  ["Диагностика", ["Компьютерная диагностика", "Осмотр перед покупкой", "Диагностика подвески", "Проверка электрики"]],
  ["Обслуживание", ["ТО мотоциклов", "Шиномонтаж", "Замена цепи и ремня", "Замена жидкостей"]],
  ["Ремонт", ["Двигатель", "Подвеска", "Тормозная система", "Карбюраторы и топливная система"]],
  ["Доп. оборудование", ["Дуги и слайдеры", "Сигнализации", "Свет и подсветка", "Аксессуары и тюнинг"]]
];

const specialtyBlocks = [
  ["Запчасти и аксессуары", "Подберем расходники, оригинальные детали и аналоги для мотоциклов, ATV, снегоходов и лодочных моторов."],
  ["Покраска и кастом", "Аэрография, подбор цвета, ремонт пластика, баков, наклейки и дизайн-проекты."],
  ["Ателье", "Перетяжка сидений, изготовление кофров и сумок, восстановление шлемов и мягких элементов."]
];

const allBrands = [
  "Honda",
  "Yamaha",
  "Kawasaki",
  "Suzuki",
  "Harley-Davidson",
  "BMW",
  "Ducati",
  "KTM",
  "Triumph",
  "BRP",
  "Arctic Cat",
  "Polaris",
  "Johnson",
  "Evinrude",
  "Tohatsu"
];

const brandModels = {
  Honda: ["CB400", "CB600 Hornet", "CBR600RR", "VFR800", "Africa Twin"],
  Yamaha: ["R6", "R1", "MT-07", "MT-09", "Tenere 700"],
  BRP: ["Outlander", "Renegade", "Can-Am Spyder", "Maverick", "Traxter"],
  Polaris: ["Sportsman", "Ranger", "RZR", "Scrambler", "General"],
  "Harley-Davidson": ["Sportster", "Softail", "Touring", "Dyna", "Street Bob"]
};

const esc = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const targetName = (page) => [page.service, page.brand, page.model].filter(Boolean).join(" ");
const pageTitle = (page) => `${targetName(page)} в ${page.location} | Мотосервис`;
const h1 = (page) => `${targetName(page)} в ${page.location}`;
const description = (page) =>
  `${h1(page)}. ${page.lead} Цена: ${page.priceFrom}. Запись по телефону +7 (495) 133-98-07.`;
const urlFor = (page) => `/landings/${page.slug}/`;

const modelsFor = (page) => {
  if (page.model) return [page.model, ...((brandModels[page.brand] || []).filter((item) => item !== page.model))];
  if (page.brand && brandModels[page.brand]) return brandModels[page.brand];
  return ["Honda", "Yamaha", "Kawasaki", "Suzuki", "BMW", "Ducati", "BRP", "Polaris"];
};

const renderList = (items) =>
  items
    .map(
      (item) => `
        <li>
          <span aria-hidden="true"></span>
          ${esc(item)}
        </li>`
    )
    .join("");

const renderCategories = (currentService) =>
  categories
    .map(([key, name, text]) => {
      const normalized = currentService.toLowerCase();
      const active =
        (key === "moto" && normalized.includes("мотоцикл")) ||
        (key === "atv" && normalized.includes("квадро")) ||
        (key === "snow" && normalized.includes("снего")) ||
        (key === "boat" && normalized.includes("лодоч")) ||
        (key === "paint" && normalized.includes("покра")) ||
        (key === "extra" && normalized.includes("хран"));
      return `
        <article class="service-card${active ? " is-active" : ""}">
          <h3>${esc(name)}</h3>
          <p>${esc(text)}</p>
        </article>`;
    })
    .join("");

const renderServiceGroups = () =>
  serviceGroups
    .map(
      ([title, items]) => `
        <article class="catalog-group">
          <h3>${esc(title)}</h3>
          <ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
        </article>`
    )
    .join("");

const renderSpecialties = () =>
  specialtyBlocks
    .map(
      ([title, text]) => `
        <article class="specialty-card">
          <h3>${esc(title)}</h3>
          <p>${esc(text)}</p>
        </article>`
    )
    .join("");

const renderFaq = (page) =>
  page.faq
    .map(
      ([question, answer]) => `
        <details>
          <summary>${esc(question)}</summary>
          <p>${esc(answer)}</p>
        </details>`
    )
    .join("");

const renderLandingLinks = () =>
  landings
    .filter((page) => page.status === "index")
    .slice(0, 5)
    .map((page) => `<a href="${urlFor(page)}">${esc(targetName(page))}</a>`)
    .join("");

const renderPage = (page, options = {}) => {
  const isHome = options.home === true;
  const title = isHome ? pageTitle(page) : pageTitle(page);
  const metaDescription = description(page);
  const canonical = isHome ? `${siteUrl}/index.html` : `${siteUrl}${urlFor(page)}`;
  const robots = page.status === "noindex" ? '<meta name="robots" content="noindex,follow" />' : "";
  const prefix = isHome ? "." : "../..";
  const models = modelsFor(page);
  const requestValue = h1(page);

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(metaDescription)}" />
    ${robots}
    <link rel="canonical" href="${esc(canonical)}" />
    <link rel="stylesheet" href="${prefix}/styles.css" />
  </head>
  <body>
    <header class="site-header" data-header>
      <a class="brand" href="${isHome ? "#top" : "/index.html"}"><span>Мото</span>сервис</a>
      <button class="menu-toggle" type="button" aria-label="Открыть меню" data-menu-toggle>
        <span></span><span></span>
      </button>
      <nav class="main-nav" data-nav>
        <a href="#services">Услуги</a>
        <a href="#works">Работы</a>
        <a href="#brands">Бренды</a>
        <a href="#contacts">Контакты</a>
      </nav>
      <a class="header-phone" href="tel:+74951339807">
        <strong>+7 (495) 133-98-07</strong>
        <small>Пн-Вс 11:00-20:00</small>
      </a>
    </header>

    <main id="top">
      <section class="hero">
        <div class="hero-copy">
          <h1>${esc(h1(page))}</h1>
          <p>${esc(page.lead)}</p>
          <div class="hero-actions">
            <a class="button button-primary" href="#request">Записаться</a>
            <a class="button button-secondary" href="#services">Посмотреть услуги</a>
          </div>
          <div class="messenger-actions" aria-label="Быстрая связь">
            <a href="https://wa.me/79036606955">WhatsApp</a>
            <a href="https://t.me/">Telegram</a>
          </div>
          <dl class="hero-facts">
            <div><dt>Стоимость</dt><dd>${esc(page.priceFrom)}</dd></div>
            <div><dt>Сроки</dt><dd>после диагностики</dd></div>
            <div><dt>Гарантия</dt><dd>до 12 месяцев</dd></div>
          </dl>
        </div>
        <div class="hero-media" aria-label="Мотоцикл в сервисной зоне">
          <div class="media-note">
            <strong>Запись сегодня</strong>
            <span>диагностика, ТО и ремонт без лишних работ</span>
          </div>
        </div>
      </section>

      <section class="about-section">
        <div>
          <h2>Работаем с мототехникой с 2008 года</h2>
          <p>Сервис вырос из практической мастерской: сначала диагностика и ремонт мотоциклов, затем квадроциклы, снегоходы, лодочные моторы, покраска, запчасти и сезонные услуги. Перед ремонтом объясняем причину неисправности и согласуем смету.</p>
        </div>
        <ul>
          <li>Сначала диагностика, потом ремонт</li>
          <li>Согласование работ до разборки</li>
          <li>Подбор оригинальных запчастей и аналогов</li>
          <li>Фиксация обращения по телефону или в мессенджере</li>
        </ul>
      </section>

      <section class="service-strip" id="services">
        <div class="section-heading">
          <h2>Категории услуг</h2>
          <p>Выберите направление. На странице сразу видны типовые работы, цены и что подготовить перед визитом.</p>
        </div>
        <div class="service-grid">${renderCategories(page.service)}</div>
      </section>

      <section class="catalog-section">
        <div class="section-heading">
          <h2>Популярные работы</h2>
          <p>Эти направления дают основу для внутренних страниц и помогают посетителю быстро найти нужную услугу.</p>
        </div>
        <div class="catalog-grid">${renderServiceGroups()}</div>
      </section>

      <section class="detail-section">
        <div class="work-list">
          <h2>Что входит в ${esc(page.service.toLowerCase())}</h2>
          <p>Мастер начинает с осмотра и согласования сметы. Работы фиксируются по симптомам, состоянию техники и доступности запчастей.</p>
          <ul>${renderList(page.works)}</ul>
        </div>
        <aside class="price-panel">
          <h3>Ориентир по стоимости</h3>
          <strong>${esc(page.priceFrom)}</strong>
          <p>Точная цена зависит от состояния техники, модели, объема разборки и запчастей. До начала ремонта согласуем смету.</p>
          <a class="button button-primary" href="#request">Получить расчет</a>
        </aside>
      </section>

      <section class="proof" aria-label="Преимущества сервиса">
        <div class="proof-item">
          <strong>С 2008</strong>
          <span>работаем с мототехникой</span>
        </div>
        <div class="proof-item">
          <strong>4 класса</strong>
          <span>мото, ATV, снегоходы, моторы</span>
        </div>
        <div class="proof-item">
          <strong>12 мес.</strong>
          <span>гарантия на часть работ</span>
        </div>
        <div class="proof-item">
          <strong>Москва</strong>
          <span>Самокатная ул., 4 стр. 13</span>
        </div>
      </section>

      <section class="split-section" id="brands">
        <div>
          <h2>${page.brand ? `Работаем с ${esc(page.brand)}` : "Работаем с популярными брендами"}</h2>
          <p>Поддерживаем японские, европейские и американские марки, а также технику BRP, Polaris и Arctic Cat. По модели заранее подскажем типовые слабые места и расходники.</p>
        </div>
        <div class="brand-cloud" aria-label="Список моделей и брендов">
          ${models.map((item) => `<span>${esc(item)}</span>`).join("")}
        </div>
      </section>

      <section class="brand-section">
        <div class="section-heading">
          <h2>Марки и модели</h2>
          <p>Для мультилендинга брендовая сетка становится отдельным слоем страниц: бренд, тип техники, модель и конкретная работа.</p>
        </div>
        <div class="brand-cloud brand-cloud-large">
          ${allBrands.map((brand) => `<span>${esc(brand)}</span>`).join("")}
        </div>
      </section>

      <section class="specialty-section">
        <div class="section-heading">
          <h2>Дополнительные направления</h2>
          <p>На исходном сайте эти разделы дают отдельные ветки спроса, поэтому в MVP они вынесены в самостоятельные блоки.</p>
        </div>
        <div class="specialty-grid">${renderSpecialties()}</div>
      </section>

      <section class="works" id="works">
        <div class="section-heading">
          <h2>Примеры работ</h2>
          <a href="#request">Показать задачу мастеру</a>
        </div>
        <div class="work-grid">
          <figure class="work-card work-one"><figcaption>Обслуживание спортбайка</figcaption></figure>
          <figure class="work-card work-two"><figcaption>Покраска бака и пластика</figcaption></figure>
          <figure class="work-card work-three"><figcaption>Ремонт подвески ATV</figcaption></figure>
          <figure class="work-card work-four"><figcaption>Диагностика двигателя</figcaption></figure>
        </div>
      </section>

      <section class="faq-section">
        <div class="section-heading">
          <h2>Частые вопросы</h2>
          <p>Ответы меняются под услугу, бренд и модель, чтобы посадочная страница была полезной, а не просто копией с другим заголовком.</p>
        </div>
        <div class="faq-list">${renderFaq(page)}</div>
      </section>

      <section class="related-section" aria-label="Другие направления">
        <h2>Другие направления сервиса</h2>
        <div class="related-links">${renderLandingLinks()}</div>
      </section>

      <section class="contact-section" id="contacts">
        <div class="contact-copy">
          <h2>Свяжитесь с нами</h2>
          <p>Опишите технику и проблему. Менеджер уточнит симптомы, подскажет ближайшее окно записи и сориентирует по диагностике.</p>
          <div class="contact-list">
            <a href="tel:+74951339807">+7 (495) 133-98-07</a>
            <span>Москва, Самокатная ул. 4 стр. 13</span>
            <span>Пн-Вс 11:00-20:00</span>
            <a href="mailto:service@proracing.su">service@proracing.su</a>
          </div>
          <div class="messenger-actions contact-messengers">
            <a href="https://wa.me/79036606955">WhatsApp</a>
            <a href="https://t.me/">Telegram</a>
          </div>
        </div>
        <form class="request-form" id="request">
          <h3>Заявка в сервис</h3>
          <label>
            <span>Страница обращения</span>
            <input name="landing" value="${esc(requestValue)}" />
          </label>
          <label>
            <span>Что нужно сделать</span>
            <textarea name="message" rows="4" placeholder="Например: ТО, диагностика, не заводится, покраска пластика"></textarea>
          </label>
          <label>
            <span>Телефон</span>
            <input type="tel" name="phone" placeholder="+7" />
          </label>
          <button class="button button-primary" type="submit">Отправить заявку</button>
          <p class="form-note" data-form-note>Демо-форма: данные не отправляются.</p>
        </form>
      </section>
    </main>

    <footer class="site-footer">
      <div>
        <strong>Мотосервис</strong>
        <span>© 2026 PRORACING.su</span>
      </div>
      <nav aria-label="Категории в подвале">
        <a href="#services">Услуги</a>
        <a href="#works">Ремонт мотоциклов</a>
        <a href="#brands">Марки и модели</a>
        <a href="#contacts">Контакты</a>
      </nav>
      <a href="#top">Наверх</a>
    </footer>

    <script src="${prefix}/script.js"></script>
  </body>
</html>`;
};

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const homePage = landings[0];
fs.writeFileSync(path.join(root, "index.html"), renderPage(homePage, { home: true }));

for (const page of landings) {
  const dir = path.join(outDir, page.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), renderPage(page));
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${landings
  .filter((page) => page.status === "index")
  .map(
    (page) => `  <url>
    <loc>${siteUrl}${urlFor(page)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);
console.log(`Generated ${landings.length} landing pages and sitemap.xml`);
