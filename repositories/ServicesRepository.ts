import { Service, ProviderServiceOffering } from '@/models/database';
import { BaseRepository } from './BaseRepository';

export class ServicesRepository extends BaseRepository<Service> {
  protected storageKey = 'services';

  async getByProviderId(providerId: string): Promise<Service[]> {
    const services = await this.getStorageData(`services_${providerId}`);
    return services.filter(service => service.providerId === providerId);
  }

  async getByShopId(shopId: string): Promise<Service[]> {
    const services = await this.getStorageData(`master_services_${shopId}`);
    return services.filter(service => service.shopId === shopId);
  }

  async createForProvider(providerId: string, serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'providerId'>): Promise<Service> {
    const now = new Date().toISOString();
    const newService = {
      ...serviceData,
      id: this.generateId(),
      providerId,
      createdAt: now,
      updatedAt: now,
    } as Service;

    const services = await this.getStorageData(`services_${providerId}`);
    const updatedServices = [...services, newService];
    await this.setStorageData(updatedServices, `services_${providerId}`);
    
    return newService;
  }

  async createForShop(shopId: string, serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'shopId'>): Promise<Service> {
    const now = new Date().toISOString();
    const newService = {
      ...serviceData,
      id: this.generateId(),
      shopId,
      createdAt: now,
      updatedAt: now,
    } as Service;

    const services = await this.getStorageData(`master_services_${shopId}`);
    const updatedServices = [...services, newService];
    await this.setStorageData(updatedServices, `master_services_${shopId}`);
    
    return newService;
  }

  async updateForProvider(providerId: string, id: string, updates: Partial<Service>): Promise<Service | null> {
    const services = await this.getStorageData(`services_${providerId}`);
    const serviceIndex = services.findIndex(service => service.id === id);
    
    if (serviceIndex === -1) {
      return null;
    }

    const updatedService = {
      ...services[serviceIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    services[serviceIndex] = updatedService;
    await this.setStorageData(services, `services_${providerId}`);
    
    return updatedService;
  }

  async updateForShop(shopId: string, id: string, updates: Partial<Service>): Promise<Service | null> {
    const services = await this.getStorageData(`master_services_${shopId}`);
    const serviceIndex = services.findIndex(service => service.id === id);
    
    if (serviceIndex === -1) {
      return null;
    }

    const updatedService = {
      ...services[serviceIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    services[serviceIndex] = updatedService;
    await this.setStorageData(services, `master_services_${shopId}`);
    
    return updatedService;
  }

  async deleteForProvider(providerId: string, id: string): Promise<boolean> {
    const services = await this.getStorageData(`services_${providerId}`);
    const filteredServices = services.filter(service => service.id !== id);
    
    if (filteredServices.length === services.length) {
      return false;
    }

    await this.setStorageData(filteredServices, `services_${providerId}`);
    return true;
  }

  async deleteForShop(shopId: string, id: string): Promise<boolean> {
    const services = await this.getStorageData(`master_services_${shopId}`);
    const filteredServices = services.filter(service => service.id !== id);
    
    if (filteredServices.length === services.length) {
      return false;
    }

    await this.setStorageData(filteredServices, `master_services_${shopId}`);
    return true;
  }
}

export class ServiceOfferingsRepository extends BaseRepository<ProviderServiceOffering> {
  protected storageKey = 'service_offerings';

  async getByProviderId(providerId: string): Promise<ProviderServiceOffering[]> {
    const offerings = await this.getStorageData(`service_offerings_${providerId}`);
    return offerings.filter(offering => offering.providerId === providerId);
  }

  async createForProvider(providerId: string, offeringData: Omit<ProviderServiceOffering, 'id' | 'createdAt' | 'updatedAt' | 'providerId'>): Promise<ProviderServiceOffering> {
    const now = new Date().toISOString();
    const newOffering = {
      ...offeringData,
      id: this.generateId(),
      providerId,
      createdAt: now,
      updatedAt: now,
    } as ProviderServiceOffering;

    const offerings = await this.getStorageData(`service_offerings_${providerId}`);
    const updatedOfferings = [...offerings, newOffering];
    await this.setStorageData(updatedOfferings, `service_offerings_${providerId}`);
    
    return newOffering;
  }

  async updateForProvider(providerId: string, id: string, updates: Partial<ProviderServiceOffering>): Promise<ProviderServiceOffering | null> {
    const offerings = await this.getStorageData(`service_offerings_${providerId}`);
    const offeringIndex = offerings.findIndex(offering => offering.id === id);
    
    if (offeringIndex === -1) {
      return null;
    }

    const updatedOffering = {
      ...offerings[offeringIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    offerings[offeringIndex] = updatedOffering;
    await this.setStorageData(offerings, `service_offerings_${providerId}`);
    
    return updatedOffering;
  }

  async toggleOffering(providerId: string, serviceId: string, isOffered: boolean, service: Service): Promise<ProviderServiceOffering> {
    const offerings = await this.getStorageData(`service_offerings_${providerId}`);
    const existingOffering = offerings.find(o => o.serviceId === serviceId);
    
    if (existingOffering) {
      const updatedOffering = {
        ...existingOffering,
        isOffered,
        updatedAt: new Date().toISOString(),
      };
      
      const updatedOfferings = offerings.map(offering => 
        offering.serviceId === serviceId ? updatedOffering : offering
      );
      
      await this.setStorageData(updatedOfferings, `service_offerings_${providerId}`);
      return updatedOffering;
    } else {
      return this.createForProvider(providerId, {
        serviceId,
        service,
        isOffered,
      });
    }
  }
}