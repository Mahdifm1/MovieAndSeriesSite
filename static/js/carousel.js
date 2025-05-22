// carousel.js

class Carousel {
    // ... (سازنده یا constructor و سایر متدها مانند init, prev, next و غیره باید اینجا باشند) ...
    // کد سازنده اصلاح شده از پاسخ قبلی باید اینجا باشد.

    loadItems(items) {
        // این خطوط برای لاگ گرفتن اضافه شده‌اند
        if (!this.inner) { // بررسی اولیه در صورت عدم مقداردهی صحیح this.inner
            console.error("Carousel ${this.inner ? this.inner.id : 'UNKNOWN'}: this.inner is not defined in loadItems.");
            return;
        }
        console.log(`Carousel ${this.inner.id}: loadItems فراخوانی شد با ${items ? items.length : '0'} آیتم.`);

        this.items = items || []; // اطمینان از اینکه items یک آرایه است
        this.totalItems = this.items.length;

        this.inner.innerHTML = ''; // پاک کردن محتوای قبلی
        if (this.totalItems === 0) {
            console.warn(`Carousel ${this.inner.id}: هیچ آیتمی برای بارگذاری وجود ندارد.`);
        }

        this.items.forEach((item, index) => {
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            try {
                // اطمینان حاصل کنید که createMediaCardHtml در این اسکوپ قابل دسترسی است
                // و خطایی ایجاد نمی‌کند.
                if (typeof createMediaCardHtml === 'undefined') {
                    console.error(`Carousel ${this.inner.id}: تابع createMediaCardHtml تعریف نشده است.`);
                    return; // ادامه نده اگر تابع اصلی برای ساخت کارت وجود ندارد
                }
                const cardHtml = createMediaCardHtml(item);
                carouselItem.innerHTML = cardHtml;
                if (index === 0 && cardHtml) { // لاگ HTML فقط برای اولین کارت جهت اختصار
                    console.log(`Carousel ${this.inner.id}: HTML برای اولین کارت:`, cardHtml);
                } else if (index === 0 && !cardHtml) {
                    console.warn(`Carousel ${this.inner.id}: createMediaCardHtml برای اولین آیتم، HTML خالی برگرداند.`);
                }
            } catch (e) {
                console.error(`Carousel ${this.inner.id}: خطا در createMediaCardHtml برای آیتم:`, item, e);
                return; // از این آیتم بگذر اگر ساخت HTML کارت خطا داد
            }
            this.inner.appendChild(carouselItem);
        });
        console.log(`Carousel ${this.inner.id}: تعداد ${this.inner.children.length} آیتم به DOM اضافه شد.`);

        // برای اطمینان از محاسبه صحیح ابعاد پس از رندر شدن DOM:
        requestAnimationFrame(() => {
            this.updateDimensions();
            this.updateButtons();
            this.updateCounter();
        });
    }

    updateDimensions() {
        if (!this.inner || !this.widthProviderContainer ) {
            console.warn(`Carousel ${this.inner ? this.inner.id : 'UNKNOWN'}: updateDimensions زودتر از موعد بازگشت. شرایط:`, {
                hasInner: !!this.inner,
                hasWidthProvider: !!this.widthProviderContainer,
            });
            return;
        }
        // اگر هیچ آیتمی وجود ندارد (چه در this.items و چه به عنوان فرزند در this.inner)
        if ((!this.items || this.items.length === 0) && this.inner.children.length === 0) {
             console.warn(`Carousel ${this.inner.id}: updateDimensions - هیچ آیتمی برای محاسبه ابعاد وجود ندارد.`);
            // return; // شاید بهتر باشد ادامه دهد تا در صورت اضافه شدن آیتم‌ها بعدا، کار کند
        }


        const containerWidth = this.widthProviderContainer.offsetWidth;
        console.log(`Carousel ${this.inner.id}: در updateDimensions - عرض کانتینر (${this.widthProviderContainer.className}): ${containerWidth}`);

        let itemsToShow = this.options.itemsToShow;
        if (window.innerWidth < 576) { itemsToShow = 1; }
        else if (window.innerWidth < 768) { itemsToShow = 2; }
        else if (window.innerWidth < 992) { itemsToShow = 3; }
        else if (window.innerWidth < 1200) { itemsToShow = 4; }

        if (itemsToShow <= 0) {
            console.error(`Carousel ${this.inner.id}: مقدار itemsToShow نامعتبر است: ${itemsToShow}`);
            return;
        }

        this.itemWidth = (containerWidth - (itemsToShow - 1) * this.options.gap) / itemsToShow;
        console.log(`Carousel ${this.inner.id}: عرض محاسبه شده برای هر آیتم: ${this.itemWidth} (itemsToShow: ${itemsToShow}, gap: ${this.options.gap})`);

        if (this.itemWidth <= 0 && containerWidth > 0) {
            console.warn(`Carousel ${this.inner.id}: عرض آیتم (${this.itemWidth}) کوچکتر یا مساوی صفر است. آیتم‌ها ممکن است نمایش داده نشوند. محاسبات gap و itemsToShow نسبت به containerWidth را بررسی کنید.`);
        } else if (containerWidth <= 0) {
            console.warn(`Carousel ${this.inner.id}: عرض کانتینر (${containerWidth}) صفر یا کمتر است. آیتم‌ها احتمالاً نمایش داده نخواهند شد.`);
        }

        const carouselItems = this.inner.querySelectorAll('.carousel-item');
        if(carouselItems.length === 0 && this.totalItems > 0) {
            console.warn(`Carousel ${this.inner.id}: هیچ عنصری با کلاس .carousel-item در .inner پیدا نشد، اما totalItems برابر ${this.totalItems} است.`);
        }
        carouselItems.forEach(item => {
            item.style.width = `${this.itemWidth}px`;
            item.style.marginRight = `${this.options.gap}px`;
        });

        this.goTo(this.currentIndex);
    }

    // ... (سایر متدها مانند goTo, updateCounter, getVisibleItems, next, prev, updateButtons, startAutoplay, stopAutoplay)
    // باید با توجه به اصلاحات پاسخ قبلی اینجا باشند.
    // به عنوان مثال، goTo باید updateButtons و updateCounter را فراخوانی کند.
    // getVisibleItems باید this.options.itemsToShow را برگرداند اگر عرض پنجره به اندازه کافی بزرگ باشد.
}

// ... (کد مربوط به new Carousel و فراخوانی ApiService.get... در رویداد DOMContentLoaded)
// این بخش نیز باید شامل بررسی تعریف بودن createMediaCardHtml و ApiService باشد.
document.addEventListener('DOMContentLoaded', function() {
    if (typeof createMediaCardHtml === 'undefined') {
        console.error('createMediaCardHtml تعریف نشده است. مطمئن شوید main.js قبل از carousel.js بارگذاری شده یا آن را اینجا تعریف کنید.');
        return;
    }
    if (typeof ApiService === 'undefined') {
        console.error('ApiService تعریف نشده است. مطمئن شوید main.js به همراه ApiService بارگذاری شده است.');
        return;
    }

    // ... (ایجاد نمونه‌های Carousel)
    const moviesCarousel = new Carousel('#moviesCarousel', { itemsToShow: 5, itemsToScroll: 1 }); // [cite: 5]
    const showsCarousel = new Carousel('#showsCarousel', { itemsToShow: 5, itemsToScroll: 1 }); // [cite: 52]
    const latestCarousel = new Carousel('#latestCarousel', { itemsToShow: 5, itemsToScroll: 1 }); // [cite: 100]

    // ... (فراخوانی‌های ApiService)
    ApiService.getRecommendedMovies()
        .then(movies => {
            if (moviesCarousel.inner) moviesCarousel.loadItems(movies); // [cite: 240, 337]
        })
        .catch(error => console.error('خطا در بارگذاری فیلم‌های پیشنهادی:', error)); // [cite: 338]

    ApiService.getRecommendedShows()
        .then(shows => {
            if (showsCarousel.inner) showsCarousel.loadItems(shows); // [cite: 241]
        })
        .catch(error => console.error('خطا در بارگذاری سریال‌های پیشنهادی:', error)); // [cite: 339]

    ApiService.getLatestReleases()
        .then(latest => {
            if (latestCarousel.inner) latestCarousel.loadItems(latest); // [cite: 242]
        })
        .catch(error => console.error('خطا در بارگذاری آخرین منتشر شده‌ها:', error)); // [cite: 340]

    ApiService.getTrending()
        .then(trending => { // [cite: 243]
            const trendingContainer = document.getElementById('trendingContainer'); // [cite: 114]
            if (trendingContainer) {
                trendingContainer.innerHTML = '';
                trending.forEach(item => {
                    const col = document.createElement('div');
                    col.className = 'col';
                    col.innerHTML = createMediaCardHtml(item); // [cite: 341]
                    trendingContainer.appendChild(col); // [cite: 342]
                });
            }
        })
        .catch(error => console.error('خطا در بارگذاری محتوای ترند:', error)); // [cite: 343]
});