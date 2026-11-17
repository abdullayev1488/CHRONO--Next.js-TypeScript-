import type { IProduct } from "../models/product";

/** İlkin (seed) məhsullar; stok və arxiv vəziyyəti seed zamanı təyin olunur */
// Seed məhsullarında qalereya və texniki xüsusiyyətlər yoxdur (modeldəki default-lar tətbiq olunur)
export type SeedProduct = Omit<IProduct, "archived" | "images" | "specs">;

export const products: SeedProduct[] = [
    {
        "name": "Rolex Submariner Date",
        "brand": "ROLEX",
        "category": "Luxury",
        "price": 1299,
        "oldPrice": 1599,
        "image": "/images/watches/Роскошные часы Rolex Submariner на подушке.png",
        "badge": "Bestseller",
        "featured": true,
        "stock": 12
    },
    {
        "name": "Omega Speedmaster Professional",
        "brand": "OMEGA",
        "category": "Luxury",
        "price": 1899,
        "oldPrice": null,
        "image": "/images/watches/Роскошный Omega Speedmaster на замшевой подушке.png",
        "badge": "New",
        "featured": true,
        "stock": 8
    },
    {
        "name": "Cartier Santos de Cartier",
        "brand": "CARTIER",
        "category": "Luxury",
        "price": 999,
        "oldPrice": 1199,
        "image": "/images/watches/Роскошные часы Cartier на замшевой подушке.png",
        "badge": "Popular",
        "featured": true,
        "stock": 5
    },
    {
        "name": "Audemars Piguet Royal Oak",
        "brand": "AUDEMARS PIGUET",
        "category": "Luxury",
        "price": 2199,
        "oldPrice": null,
        "image": "/images/watches/Роскошные часы Audemars Piguet Royal Oak.png",
        "badge": "Exclusive",
        "featured": true,
        "stock": 15
    },
    {
        "name": "Patek Philippe Nautilus",
        "brand": "PATEK PHILIPPE",
        "category": "Luxury",
        "price": 1499,
        "oldPrice": 1799,
        "image": "/images/watches/Роскошные часы на бежевой подушке.png",
        "badge": "Sale",
        "featured": false,
        "stock": 3
    },
    {
        "name": "IWC Portugieser Chronograph",
        "brand": "IWC",
        "category": "Classic",
        "price": 1199,
        "oldPrice": null,
        "image": "/images/watches/Роскошный хронограф на замшевой подушке.png",
        "badge": null,
        "featured": false,
        "stock": 20
    },
    {
        "name": "Breitling Navitimer",
        "brand": "BREITLING",
        "category": "Luxury",
        "price": 3299,
        "oldPrice": 3699,
        "image": "/images/watches/Роскошный Breitling Navitimer на замшевой подушке.png",
        "badge": "Exclusive",
        "featured": false,
        "stock": 7
    },
    {
        "name": "TAG Heuer Carrera",
        "brand": "TAG HEUER",
        "category": "Modern",
        "price": 1399,
        "oldPrice": null,
        "image": "/images/watches/Роскошный скелетонизированный хронограф Carrera.png",
        "badge": "New",
        "featured": false,
        "stock": 10
    },
    {
        "name": "Tudor Black Bay",
        "brand": "TUDOR",
        "category": "Classic",
        "price": 2899,
        "oldPrice": 3199,
        "image": "/images/watches/Роскошные часы Tudor на замшевой подушке.png",
        "badge": "Popular",
        "featured": false,
        "stock": 4
    },
    {
        "name": "Seiko Presage Cocktail Time",
        "brand": "SEIKO",
        "category": "Classic",
        "price": 1099,
        "oldPrice": null,
        "image": "/images/watches/Роскошные часы Seiko Presage на замшевой подушке.png",
        "badge": null,
        "featured": false,
        "stock": 18
    },
    {
        "name": "Longines Master Collection",
        "brand": "LONGINES",
        "category": "Classic",
        "price": 1699,
        "oldPrice": 1999,
        "image": "/images/watches/Роскошные часы Longines с лунной фазой.png",
        "badge": "Sale",
        "featured": false,
        "stock": 12
    },
    {
        "name": "Tissot PRX Powermatic 80",
        "brand": "TISSOT",
        "category": "Modern",
        "price": 2499,
        "oldPrice": null,
        "image": "/images/watches/Часы Tissot PRX на бежевой подушке.png",
        "badge": "Exclusive",
        "featured": false,
        "stock": 8
    },
    {
        "name": "Hamilton Khaki Field",
        "brand": "HAMILTON",
        "category": "Classic",
        "price": 1799,
        "oldPrice": 2099,
        "image": "/images/watches/Часы Hamilton Khaki Field на замшевой подушке.png",
        "badge": "Bestseller",
        "featured": false,
        "stock": 5
    },
    {
        "name": "Oris Aquis Date",
        "brand": "ORIS",
        "category": "Modern",
        "price": 1999,
        "oldPrice": null,
        "image": "/images/watches/Роскошные часы Oris Aquis на замшевой подушке.png",
        "badge": "New",
        "featured": false,
        "stock": 15
    },
    {
        "name": "Grand Seiko Snowflake",
        "brand": "GRAND SEIKO",
        "category": "Luxury",
        "price": 4499,
        "oldPrice": 4999,
        "image": "/images/watches/Роскошные часы Grand Seiko на замшевой подушке.png",
        "badge": "Exclusive",
        "featured": false,
        "stock": 3
    },
    {
        "name": "Zenith Chronomaster",
        "brand": "ZENITH",
        "category": "Luxury",
        "price": 1599,
        "oldPrice": null,
        "image": "/images/watches/Роскошные часы Zenith на замшевой подушке.png",
        "badge": null,
        "featured": false,
        "stock": 20
    },
    {
        "name": "Panerai Luminor Marina",
        "brand": "PANERAI",
        "category": "Luxury",
        "price": 1899,
        "oldPrice": 2199,
        "image": "/images/watches/Роскошные часы Panerai на замшевой подушке.png",
        "badge": "Popular",
        "featured": false,
        "stock": 7
    },
    {
        "name": "Bulgari Octo Finissimo",
        "brand": "BVLGARI",
        "category": "Luxury",
        "price": 2299,
        "oldPrice": null,
        "image": "/images/watches/Титановый Octo на замшевой подушке.png",
        "badge": "New",
        "featured": false,
        "stock": 10
    },
    {
        "name": "Hublot Big Bang Unico",
        "brand": "HUBLOT",
        "category": "Luxury",
        "price": 3599,
        "oldPrice": 3999,
        "image": "/images/watches/Скелетон Hublot на бежевой подушке.png",
        "badge": "Exclusive",
        "featured": false,
        "stock": 4
    },
    {
        "name": "Montblanc 1858 Automatic",
        "brand": "MONTBLANC",
        "category": "Classic",
        "price": 899,
        "oldPrice": 1099,
        "image": "/images/watches/Роскошные часы Montblanc на замшевой подушке.png",
        "badge": "Sale",
        "featured": false,
        "stock": 18
    },
    {
        "name": "Chopard Alpine Eagle",
        "brand": "CHOPARD",
        "category": "Luxury",
        "price": 1499,
        "oldPrice": null,
        "image": "/images/watches/Роскошные часы на кожаной подушке.png",
        "badge": null,
        "featured": false,
        "stock": 12
    },
    {
        "name": "Jaeger-LeCoultre Reverso",
        "brand": "JAEGER-LECOULTRE",
        "category": "Classic",
        "price": 5299,
        "oldPrice": 5799,
        "image": "/images/watches/Элегантные часы на кожаном ремешке.png",
        "badge": "Exclusive",
        "featured": false,
        "stock": 8
    },
    {
        "name": "Franck Muller Vanguard",
        "brand": "FRANCK MULLER",
        "category": "Luxury",
        "price": 1299,
        "oldPrice": null,
        "image": "/images/watches/Роскошные часы Franck Muller на замшевой подушке.png",
        "badge": "New",
        "featured": false,
        "stock": 5
    },
    {
        "name": "Citizen Tsuyosa Automatic",
        "brand": "CITIZEN",
        "category": "Modern",
        "price": 2399,
        "oldPrice": 2699,
        "image": "/images/watches/Роскошные часы Citizen на замшевой подушке.png",
        "badge": "Popular",
        "featured": false,
        "stock": 15
    },
    {
        "name": "Casio G-SHOCK GA-2100",
        "brand": "CASIO",
        "category": "Modern",
        "price": 3999,
        "oldPrice": null,
        "image": "/images/watches/Часы G-SHOCK на бежевой подушке.png",
        "badge": "Exclusive",
        "featured": false,
        "stock": 3
    },
    {
        "name": "Mido Ocean Star 200C",
        "brand": "MIDO",
        "category": "Modern",
        "price": 799,
        "oldPrice": 999,
        "image": "/images/watches/Роскошные часы Mido Ocean Star на замшевой подушке.png",
        "badge": "Sale",
        "featured": false,
        "stock": 20
    },
    {
        "name": "Certina DS Action Diver",
        "brand": "CERTINA",
        "category": "Modern",
        "price": 1699,
        "oldPrice": null,
        "image": "/images/watches/Роскошные часы Certina на кожаной подставке.png",
        "badge": null,
        "featured": false,
        "stock": 7
    },
    {
        "name": "Rado Captain Cook",
        "brand": "RADO",
        "category": "Classic",
        "price": 4799,
        "oldPrice": 5199,
        "image": "/images/watches/Бронзовые часы Rado Captain Cook на замшевой подушке.png",
        "badge": "Exclusive",
        "featured": false,
        "stock": 10
    },
    {
        "name": "Frederique Constant Classics Index",
        "brand": "FREDERIQUE CONSTANT",
        "category": "Classic",
        "price": 1199,
        "oldPrice": null,
        "image": "/images/watches/Роскошные часы на замшевой подушке.png",
        "badge": "Popular",
        "featured": false,
        "stock": 4
    },
    {
        "name": "Alpina Startimer Pilot",
        "brand": "ALPINA",
        "category": "Classic",
        "price": 2999,
        "oldPrice": 3499,
        "image": "/images/watches/Роскошные пилотские часы на кожаном ремешке.png",
        "badge": "Bestseller",
        "featured": false,
        "stock": 18
    }
];
