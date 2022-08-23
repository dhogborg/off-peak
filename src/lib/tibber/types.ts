export interface Home {
  id: string
  meteringPointData: {
    gridCompany: string
    gridAreaCode: string
    priceAreaCode: string
  }
  address: Address
}

export interface Address {
  address1: string
  address2: string
  address3: string
  postalCode: string
  city: string
  country: string
}

export interface ConsumptionNode {
  from: string
  to: string
  unitCost: number | null
  consumption: number | null
}

export interface PriceNode {
  startsAt: string
  total: number
}

export enum Interval {
  Hourly = 'HOURLY',
  Daily = 'DAILY',
  Monthly = 'MONTLY',
}
