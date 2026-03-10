import { DataSource } from 'typeorm';

// Cloud SQL uses Google-managed certs that Node can't verify by default
if (process.env.DATABASE_URL?.includes('ssl=true')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
import { AppSetting } from './entities/AppSetting.js';
import { Entidad } from './entities/Entidad.js';
import { ContextoComprobante } from './entities/ContextoComprobante.js';
import { Comprobante } from './entities/Comprobante.js';
import { OrdenPublicidad } from './entities/OrdenPublicidad.js';
import { ItemOrdenPublicidad } from './entities/ItemOrdenPublicidad.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [AppSetting, Entidad, ContextoComprobante, Comprobante, OrdenPublicidad, ItemOrdenPublicidad],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  extra: process.env.DATABASE_URL?.includes('ssl=true')
    ? { ssl: { rejectUnauthorized: false } }
    : {},
});
