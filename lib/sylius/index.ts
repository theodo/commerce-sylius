import { REST_METHODS, SYLIUS_API_ENDPOINT } from 'lib/constants';
import { normalizeCollection } from './normalizer/collection-normalizer';
import { normalizeProduct } from './normalizer/product-normalizer';
import { SyliusProduct, SyliusTaxon } from './sylius-types/product-types';
import { AddToCartPayload, GetCollectionProductsPayload, GetProductsPayload } from './types';

const DOMAIN = `${process.env.SYLIUS_STORE_DOMAIN}`;
const ENDPOINT = `${DOMAIN}${SYLIUS_API_ENDPOINT}`;

// Fetch
export default async function syliusRequest(
  method: string,
  path = '',
  payload?: Record<string, unknown> | undefined
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  };

  if (payload) {
    options.body = JSON.stringify(payload);
  }

  try {
    const result = await fetch(`${ENDPOINT}${path}`, options);

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body
    };
  } catch (e) {
    throw {
      error: e
    };
  }
}

// Pages
export const getPages = () => [];
export const getPage = () => {};

// Products
export const getProducts = async (payload: GetProductsPayload) => {
  const url = new URL(`${ENDPOINT}/products`);
  if (payload.query) {
    url.searchParams.set('translations.name', payload.query);
  }
  const orderBy = payload.reverse ? 'desc' : 'asc';

  if (payload.sortKey) {
    switch (payload.sortKey) {
      case 'RELEVANCE':
        break;
      case 'BEST_SELLING':
        break;
      case 'CREATED_AT':
        url.searchParams.set('order[createdAt]', orderBy);
        break;
      case 'PRICE':
        url.searchParams.set('order[price]', orderBy);
        break;
      default:
        break;
    }
  }

  const data = await syliusRequest(REST_METHODS.GET, '/products' + url.search);
  const syliusProducts = data.body;
  const products = syliusProducts.map((syliusProduct: SyliusProduct) =>
    normalizeProduct(syliusProduct)
  );
  return products;
};

export const getProduct = async (slug: string) => {
  const data = await syliusRequest(REST_METHODS.GET, '/products-by-slug/' + slug);

  const syliusProduct = data.body;
  const product = normalizeProduct(syliusProduct);

  return product;
};
export const getProductRecommendations = () => {
  return [];
};
export const getCollections = async () => {
  const data = await syliusRequest(REST_METHODS.GET, '/taxons');

  const syliusTaxons = data.body;
  const collections = syliusTaxons.map((syliusTaxon: SyliusTaxon) =>
    normalizeCollection(syliusTaxon)
  );

  return collections;
};

export const getCollection = async (taxonCode: string) => {
  const data = await syliusRequest(REST_METHODS.GET, '/taxons/' + taxonCode);

  const syliusTaxon = data.body;
  const collection = normalizeCollection(syliusTaxon);

  return collection;
};

export const getCollectionProducts = async (payload: GetCollectionProductsPayload) => {
  const url = new URL(`${ENDPOINT}/products`);
  if (payload.collection) {
    url.searchParams.set('productTaxons.taxon.code', payload.collection);
  }
  const orderBy = payload.reverse ? 'desc' : 'asc';

  if (payload.sortKey) {
    switch (payload.sortKey) {
      case 'RELEVANCE':
        break;
      case 'BEST_SELLING':
        break;
      case 'CREATED_AT':
        url.searchParams.set('order[createdAt]', orderBy);
        break;
      case 'PRICE':
        url.searchParams.set('order[price]', orderBy);
        break;
      default:
        break;
    }
  }

  const data = await syliusRequest(REST_METHODS.GET, '/products' + url.search);
  const syliusProducts = data.body;
  const products = syliusProducts.map((syliusProduct: SyliusProduct) =>
    normalizeProduct(syliusProduct)
  );
  return products;
};

// Cart
export const createCart = async () => {
  const cart = await syliusRequest(REST_METHODS.POST, '/orders', { localeCode: 'fr_FR' });
  return cart;
};
export const getCart = (cartId: string) => {
  syliusRequest(REST_METHODS.GET, `/orders/${cartId}`);
  return {};
};
export const addToCart = (cartId: string | undefined, payload: AddToCartPayload[]) => {
  syliusRequest(REST_METHODS.PUT, `/orders/${cartId}/items`, payload[0]);
  return {};
};
export const removeFromCart = () => {};
export const updateCart = () => {};

// Site
export const getMenu = () => [
  {
    title: 'All',
    path: '/search'
  }
];
