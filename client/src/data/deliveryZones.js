// Delivery fee is based on distance tier from Lynbrook (our home base), not a fixed
// per-suburb amount. Tier assignments below are an approximation from general Melbourne
// geography, not measured driving distance — double check before relying on them.
// Tiers: within10 (< 10km) | 10to20 | 20to30 | 30plus
const deliveryZones = [
  { id: 1,  suburb: 'Lynbrook',           postcode: '3975', tier: 'within10', is_available: true, min_order: 30.00 },
  { id: 2,  suburb: 'Lyndhurst',          postcode: '3975', tier: 'within10', is_available: true, min_order: 30.00 },
  { id: 3,  suburb: 'Hallam',             postcode: '3803', tier: 'within10', is_available: true, min_order: 30.00 },
  { id: 4,  suburb: 'Hampton Park',       postcode: '3976', tier: 'within10', is_available: true, min_order: 30.00 },
  { id: 5,  suburb: 'Berwick',            postcode: '3806', tier: 'within10', is_available: true, min_order: 30.00 },
  { id: 6,  suburb: 'Narre Warren',       postcode: '3805', tier: 'within10', is_available: true, min_order: 30.00 },
  { id: 7,  suburb: 'Cranbourne',         postcode: '3977', tier: 'within10', is_available: true, min_order: 30.00 },
  { id: 8,  suburb: 'Cranbourne North',   postcode: '3977', tier: 'within10', is_available: true, min_order: 30.00 },
  { id: 9,  suburb: 'Clyde',              postcode: '3978', tier: 'within10', is_available: true, min_order: 30.00 },
  { id: 10, suburb: 'Beaconsfield',       postcode: '3807', tier: 'within10', is_available: true, min_order: 30.00 },
  { id: 11, suburb: 'Cranbourne East',    postcode: '3977', tier: '10to20',   is_available: true, min_order: 35.00 },
  { id: 12, suburb: 'Clyde North',        postcode: '3978', tier: '10to20',   is_available: true, min_order: 35.00 },
  { id: 13, suburb: 'Narre Warren South', postcode: '3805', tier: '10to20',   is_available: true, min_order: 35.00 },
  { id: 14, suburb: 'Endeavour Hills',    postcode: '3802', tier: '10to20',   is_available: true, min_order: 35.00 },
  { id: 15, suburb: 'Officer',            postcode: '3809', tier: '10to20',   is_available: true, min_order: 35.00 },
  { id: 16, suburb: 'Dandenong',          postcode: '3175', tier: '10to20',   is_available: true, min_order: 35.00 },
  { id: 17, suburb: 'Keysborough',        postcode: '3173', tier: '10to20',   is_available: true, min_order: 35.00 },
  { id: 18, suburb: 'Noble Park',         postcode: '3174', tier: '10to20',   is_available: true, min_order: 35.00 },
  { id: 19, suburb: 'Springvale',         postcode: '3171', tier: '10to20',   is_available: true, min_order: 35.00 },
  { id: 20, suburb: 'Rowville',           postcode: '3178', tier: '10to20',   is_available: true, min_order: 35.00 },
  { id: 21, suburb: 'Pakenham',           postcode: '3810', tier: '10to20',   is_available: true, min_order: 35.00 },
  { id: 22, suburb: 'Wheelers Hill',      postcode: '3150', tier: '20to30',   is_available: true, min_order: 40.00 },
  { id: 23, suburb: 'Glen Waverley',      postcode: '3150', tier: '20to30',   is_available: true, min_order: 40.00 },
];

export default deliveryZones;
