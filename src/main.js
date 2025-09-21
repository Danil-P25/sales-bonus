/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
   // purchase — это одна из записей в поле items из чека в data.purchase_records
   // _product — это продукт из коллекции data.products
   const { discount, sale_price, quantity } = purchase;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    const { profit } = seller;
    // @TODO: Расчет бонуса от позиции в рейтинге
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
    // main.js

    function analyzeSalesData(data, options = {}) {
    // ==================== ШАГ 1: Проверка входных данных ====================
    if (!data 
        || !Array.isArray(data.sellers) 
        || !Array.isArray(data.products)
        || !Array.isArray(data.purchase_records)
        || data.sellers.length === 0
        || data.products.length === 0
        || data.purchase_records.length === 0
    ) {
        throw new Error('Некорректные входные данные');
    }

    // ==================== ШАГ 2: Проверка опций ====================
    const { calculateRevenue, calculateBonus } = options;
    
    if (typeof calculateRevenue !== 'function' || typeof calculateBonus !== 'function') {
        throw new Error('Неверные функции в опциях');
    }

    // ==================== ШАГ 3: Подготовка промежуточных данных ====================
    const sellerStats = data.sellers.map(seller => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
    }));

    // ==================== ШАГ 4: Преобразование в объекты (индексы) ====================
    const sellerIndex = sellerStats.reduce((acc, seller) => {
        acc[seller.id] = seller;
        return acc;
    }, {});

    const productIndex = data.products.reduce((acc, product) => {
        acc[product.sku] = product;
        return acc;
    }, {});

    // ==================== Реализация бизнес-логики ====================
    
    // ==================== ШАГ 1: Двойной цикл перебора ====================
    data.purchase_records.forEach(record => {
        const seller = sellerIndex[record.seller_id];
        
        if (!seller) return;

        seller.sales_count += 1;
        seller.revenue += record.total_amount;
        

        // Обработка каждого товара в чеке
        record.items.forEach(item => {
            const product = productIndex[item.sku];
            
            if (!product) return;

            const revenue = calculateRevenue(item, product);
            
            // Расчет себестоимости
            const cost = product.purchase_price * item.quantity;
            
            const itemProfit = revenue - cost;

            seller.profit += itemProfit;

            // Учет проданных товаров
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += (seller.products_sold[item.sku] || 0) + item.quantity;
        });
    });
    // ==================== ШАГ 2: Упорядочивание по прибыли ====================
    sellerStats.sort((a, b) => b.profit - a.profit);

    // ==================== ШАГ 3: Назначение премий ====================
    sellerStats.forEach((seller, index) => {
        // Расчет бонуса
        seller.bonus = calculateBonus(index, sellerStats.length, seller);
        
        // Формирование топ-10 товаров
        seller.top_products = Object.entries(seller.products_sold)
            .map(([sku, quantity]) => ({ sku, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
    });

    // ==================== ШАГ 4: Формирование результата ====================
    return sellerStats.map(seller => ({
        seller_id: seller.id,
        name: seller.name,
        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),
        sales_count: seller.sales_count,
        top_products: seller.top_products,
        bonus: +seller.bonus.toFixed(2)
    }));
}

// ==================== Доп ФУНКЦИИ ====================
function calculateSimpleRevenue(purchase, _product) {
    
    const discountMultiplier = 1 - (purchase.discount / 100);
    return +(purchase.sale_price * purchase.quantity * discountMultiplier);
}

function calculateBonusByProfit(index, total, seller) {
    
    if (index === 0) {
        return +(seller.profit * 0.15).toFixed(2); // 15% от прибыли
    } else if (index === 1 || index === 2) {
        return +(seller.profit * 0.10).toFixed(2); // 10% от прибыли
    } else if (index === total - 1) {
        return 0; // 0% для последнего
    } else {
        return +(seller.profit * 0.05).toFixed(2); // 5% для остальных
    }
}
