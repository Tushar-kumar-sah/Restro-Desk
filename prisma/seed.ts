import { PrismaClient, UserRoleType, FoodType, TableStatus, StationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPw(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Starting RestoDesk Database Seeding...');

  // 1. BRAND
  const brand = await prisma.brand.upsert({
    where: { slug: 'restodesk-demo' },
    update: {},
    create: {
      name: 'RestoDesk Hospitality',
      slug: 'restodesk-demo',
      code: 'RESTO1',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      website: 'https://restodesk.local',
    },
  });
  console.log(`✅ Brand: ${brand.name} (${brand.id})`);

  // 2. ROLES & PERMISSIONS
  const roleTypes: UserRoleType[] = ['OWNER', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN', 'MARKETING'];
  const createdRoles: Record<string, string> = {};

  for (const roleType of roleTypes) {
    const role = await prisma.role.upsert({
      where: {
        brandId_name: {
          brandId: brand.id,
          name: roleType.charAt(0) + roleType.slice(1).toLowerCase(),
        },
      },
      update: {},
      create: {
        brandId: brand.id,
        name: roleType.charAt(0) + roleType.slice(1).toLowerCase(),
        type: roleType,
        isSystem: true,
        description: `Standard system role for ${roleType}`,
      },
    });
    createdRoles[roleType] = role.id;
  }
  console.log('✅ Roles initialized: Owner, Manager, Cashier, Waiter, Kitchen, Marketing');

  // 3. OUTLETS (3 Outlets)
  const outletsData = [
    {
      name: 'Indiranagar Flagship',
      code: 'BLR-IND-01',
      phone: '+91 80 4123 4567',
      email: 'indiranagar@restodesk.com',
      address: '100ft Road, 12th Main, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      gstin: '29ABCDE1234F1Z5',
      fssaiNumber: '11223344556677',
      printerPaperWidth: '80mm',
      taxIncludedInPrice: false,
      defaultGstPercent: 5.0,
      autoPrintKOT: true,
      autoPrintBill: true,
    },
    {
      name: 'Koramangala Bistro',
      code: 'BLR-KOR-02',
      phone: '+91 80 4987 6543',
      email: 'koramangala@restodesk.com',
      address: '80ft Road, 4th Block, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
      gstin: '29ABCDE1234F1Z5',
      fssaiNumber: '11223344556688',
      printerPaperWidth: '80mm',
      taxIncludedInPrice: false,
      defaultGstPercent: 5.0,
      autoPrintKOT: true,
      autoPrintBill: true,
    },
    {
      name: 'Whitefield Express',
      code: 'BLR-WHI-03',
      phone: '+91 80 4321 0987',
      email: 'whitefield@restodesk.com',
      address: 'ITPL Main Road, Prestige Shantiniketan, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
      gstin: '29ABCDE1234F1Z5',
      fssaiNumber: '11223344556699',
      printerPaperWidth: '58mm',
      taxIncludedInPrice: true,
      defaultGstPercent: 5.0,
      autoPrintKOT: true,
      autoPrintBill: true,
    },
  ];

  const createdOutlets: any[] = [];
  for (const oData of outletsData) {
    const outlet = await prisma.outlet.upsert({
      where: {
        brandId_code: {
          brandId: brand.id,
          code: oData.code,
        },
      },
      update: {},
      create: {
        brandId: brand.id,
        ...oData,
      },
    });
    createdOutlets.push(outlet);
  }
  console.log(`✅ 3 Outlets initialized (${createdOutlets.map((o) => o.name).join(', ')})`);

  // 4. USERS (Admin account with tibetan@2026)
  const defaultPasswordHash = await hashPw('tibetan@2026');
  const demoUsers = [
    {
      name: 'Tibetan Admin',
      email: 'tibetan@info.in',
      phone: '9876543210',
      roleType: 'OWNER',
      outletId: createdOutlets[0].id,
    },
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        brandId: brand.id,
        outletId: u.outletId,
        roleId: createdRoles[u.roleType],
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash: defaultPasswordHash,
      },
    });
  }
  console.log('✅ Demo Users created for Owner, Manager, Cashier, Waiter, Kitchen (Pw: Password@123)');

  // 5. TAX GROUPS
  const gst5 = await prisma.taxGroup.create({
    data: {
      brandId: brand.id,
      name: 'GST 5% (Food & Beverage)',
      cgstRate: 2.5,
      sgstRate: 2.5,
      igstRate: 0.0,
      isInclusive: false,
    },
  });

  // 6. SECTIONS & 20 TABLES (Indiranagar Outlet)
  const primaryOutlet = createdOutlets[0];

  const secAC = await prisma.section.create({
    data: { outletId: primaryOutlet.id, name: 'Ground Floor AC Dining', floorNumber: 1 },
  });
  const secRooftop = await prisma.section.create({
    data: { outletId: primaryOutlet.id, name: 'First Floor Rooftop Lounge', floorNumber: 2 },
  });
  const secPatio = await prisma.section.create({
    data: { outletId: primaryOutlet.id, name: 'Outdoor Garden Patio', floorNumber: 1 },
  });

  // 20 Tables
  const tableData = [
    // AC Dining (T-01 to T-10)
    { tableNumber: 'T-01', capacity: 2, sectionId: secAC.id, posX: 50, posY: 50 },
    { tableNumber: 'T-02', capacity: 2, sectionId: secAC.id, posX: 150, posY: 50 },
    { tableNumber: 'T-03', capacity: 4, sectionId: secAC.id, posX: 250, posY: 50 },
    { tableNumber: 'T-04', capacity: 4, sectionId: secAC.id, posX: 350, posY: 50 },
    { tableNumber: 'T-05', capacity: 6, sectionId: secAC.id, posX: 50, posY: 180 },
    { tableNumber: 'T-06', capacity: 6, sectionId: secAC.id, posX: 150, posY: 180 },
    { tableNumber: 'T-07', capacity: 4, sectionId: secAC.id, posX: 250, posY: 180 },
    { tableNumber: 'T-08', capacity: 4, sectionId: secAC.id, posX: 350, posY: 180 },
    { tableNumber: 'T-09', capacity: 8, sectionId: secAC.id, posX: 50, posY: 310 },
    { tableNumber: 'T-10', capacity: 8, sectionId: secAC.id, posX: 250, posY: 310 },

    // Rooftop Lounge (T-11 to T-16)
    { tableNumber: 'T-11', capacity: 2, sectionId: secRooftop.id, posX: 60, posY: 60 },
    { tableNumber: 'T-12', capacity: 2, sectionId: secRooftop.id, posX: 180, posY: 60 },
    { tableNumber: 'T-13', capacity: 4, sectionId: secRooftop.id, posX: 300, posY: 60 },
    { tableNumber: 'T-14', capacity: 4, sectionId: secRooftop.id, posX: 60, posY: 200 },
    { tableNumber: 'T-15', capacity: 6, sectionId: secRooftop.id, posX: 180, posY: 200 },
    { tableNumber: 'T-16', capacity: 6, sectionId: secRooftop.id, posX: 300, posY: 200 },

    // Garden Patio (T-17 to T-20)
    { tableNumber: 'T-17', capacity: 4, sectionId: secPatio.id, posX: 50, posY: 50 },
    { tableNumber: 'T-18', capacity: 4, sectionId: secPatio.id, posX: 200, posY: 50 },
    { tableNumber: 'T-19', capacity: 4, sectionId: secPatio.id, posX: 50, posY: 180 },
    { tableNumber: 'T-20', capacity: 4, sectionId: secPatio.id, posX: 200, posY: 180 },
  ];

  for (const td of tableData) {
    await prisma.table.create({
      data: {
        outletId: primaryOutlet.id,
        sectionId: td.sectionId,
        tableNumber: td.tableNumber,
        capacity: td.capacity,
        posX: td.posX,
        posY: td.posY,
        status: 'VACANT',
      },
    });
  }
  console.log('✅ 20 Floor Tables initialized across 3 Sections');

  // 7. MENU: CATEGORIES & 60+ ITEMS
  const categoriesData = [
    { name: 'Tandoori & Starters', sortOrder: 1 },
    { name: 'Main Course (Curries)', sortOrder: 2 },
    { name: 'Biryani & Rice Bowls', sortOrder: 3 },
    { name: 'Tandoori Breads & Naans', sortOrder: 4 },
    { name: 'Indo-Chinese Delights', sortOrder: 5 },
    { name: 'Desserts & Sweets', sortOrder: 6 },
    { name: 'Beverages & Mocktails', sortOrder: 7 },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.create({
      data: {
        brandId: brand.id,
        name: c.name,
        sortOrder: c.sortOrder,
      },
    });
    catMap[c.name] = cat.id;
  }

  // 60+ Menu Items
  const menuItems = [
    // Tandoori & Starters
    { cat: 'Tandoori & Starters', name: 'Paneer Tikka Angara', code: 'STA01', price: 340, type: 'VEG' as FoodType, prep: 15 },
    { cat: 'Tandoori & Starters', name: 'Dahi Ke Kebab', code: 'STA02', price: 290, type: 'VEG' as FoodType, prep: 12 },
    { cat: 'Tandoori & Starters', name: 'Malai Soya Chaap', code: 'STA03', price: 310, type: 'VEG' as FoodType, prep: 15 },
    { cat: 'Tandoori & Starters', name: 'Hara Bhara Kebab', code: 'STA04', price: 260, type: 'VEG' as FoodType, prep: 12 },
    { cat: 'Tandoori & Starters', name: 'Crispy Corn Salt & Pepper', code: 'STA05', price: 240, type: 'VEG' as FoodType, prep: 10 },
    { cat: 'Tandoori & Starters', name: 'Tandoori Chicken (Half)', code: 'STA06', price: 360, type: 'NON_VEG' as FoodType, prep: 20 },
    { cat: 'Tandoori & Starters', name: 'Murgh Malai Tikka', code: 'STA07', price: 390, type: 'NON_VEG' as FoodType, prep: 18 },
    { cat: 'Tandoori & Starters', name: 'Bhatti Da Murgh', code: 'STA08', price: 380, type: 'NON_VEG' as FoodType, prep: 18 },
    { cat: 'Tandoori & Starters', name: 'Amritsari Fish Fry', code: 'STA09', price: 440, type: 'NON_VEG' as FoodType, prep: 15 },
    { cat: 'Tandoori & Starters', name: 'Mutton Seekh Kebab', code: 'STA10', price: 460, type: 'NON_VEG' as FoodType, prep: 20 },

    // Main Course
    { cat: 'Main Course (Curries)', name: 'Paneer Butter Masala', code: 'CUR01', price: 360, type: 'VEG' as FoodType, prep: 15 },
    { cat: 'Main Course (Curries)', name: 'Dal Makhani Special', code: 'CUR02', price: 320, type: 'VEG' as FoodType, prep: 12 },
    { cat: 'Main Course (Curries)', name: 'Kadai Paneer', code: 'CUR03', price: 350, type: 'VEG' as FoodType, prep: 15 },
    { cat: 'Main Course (Curries)', name: 'Palak Paneer', code: 'CUR04', price: 340, type: 'VEG' as FoodType, prep: 15 },
    { cat: 'Main Course (Curries)', name: 'Shahi Malai Kofta', code: 'CUR05', price: 380, type: 'VEG' as FoodType, prep: 18 },
    { cat: 'Main Course (Curries)', name: 'Pindi Chana Masala', code: 'CUR06', price: 280, type: 'VEG' as FoodType, prep: 12 },
    { cat: 'Main Course (Curries)', name: 'Yellow Dal Tadka', code: 'CUR07', price: 240, type: 'VEG' as FoodType, prep: 10 },
    { cat: 'Main Course (Curries)', name: 'Butter Chicken Old Delhi Style', code: 'CUR08', price: 420, type: 'NON_VEG' as FoodType, prep: 18 },
    { cat: 'Main Course (Curries)', name: 'Chicken Tikka Masala', code: 'CUR09', price: 410, type: 'NON_VEG' as FoodType, prep: 18 },
    { cat: 'Main Course (Curries)', name: 'Kadai Chicken', code: 'CUR10', price: 390, type: 'NON_VEG' as FoodType, prep: 18 },
    { cat: 'Main Course (Curries)', name: 'Mutton Rogan Josh', code: 'CUR11', price: 540, type: 'NON_VEG' as FoodType, prep: 22 },
    { cat: 'Main Course (Curries)', name: 'Bengali Fish Curry', code: 'CUR12', price: 460, type: 'NON_VEG' as FoodType, prep: 18 },

    // Biryani & Rice
    { cat: 'Biryani & Rice Bowls', name: 'Hyderabadi Chicken Dum Biryani', code: 'BIR01', price: 380, type: 'NON_VEG' as FoodType, prep: 15 },
    { cat: 'Biryani & Rice Bowls', name: 'Royal Mutton Biryani', code: 'BIR02', price: 490, type: 'NON_VEG' as FoodType, prep: 18 },
    { cat: 'Biryani & Rice Bowls', name: 'Lucknowi Veg Dum Biryani', code: 'BIR03', price: 310, type: 'VEG' as FoodType, prep: 15 },
    { cat: 'Biryani & Rice Bowls', name: 'Paneer Tikka Biryani', code: 'BIR04', price: 340, type: 'VEG' as FoodType, prep: 15 },
    { cat: 'Biryani & Rice Bowls', name: 'Egg Biryani (2 Eggs)', code: 'BIR05', price: 290, type: 'EGG' as FoodType, prep: 12 },
    { cat: 'Biryani & Rice Bowls', name: 'Jeera Rice with Desi Ghee', code: 'BIR06', price: 190, type: 'VEG' as FoodType, prep: 8 },
    { cat: 'Biryani & Rice Bowls', name: 'Steamed Basmati Rice', code: 'BIR07', price: 150, type: 'VEG' as FoodType, prep: 5 },
    { cat: 'Biryani & Rice Bowls', name: 'Veg Pulao with Raita', code: 'BIR08', price: 220, type: 'VEG' as FoodType, prep: 10 },

    // Breads
    { cat: 'Tandoori Breads & Naans', name: 'Butter Naan', code: 'BRD01', price: 65, type: 'VEG' as FoodType, prep: 5 },
    { cat: 'Tandoori Breads & Naans', name: 'Garlic Butter Naan', code: 'BRD02', price: 85, type: 'VEG' as FoodType, prep: 6 },
    { cat: 'Tandoori Breads & Naans', name: 'Cheese Garlic Naan', code: 'BRD03', price: 120, type: 'VEG' as FoodType, prep: 8 },
    { cat: 'Tandoori Breads & Naans', name: 'Tandoori Roti (Plain)', code: 'BRD04', price: 35, type: 'VEG' as FoodType, prep: 4 },
    { cat: 'Tandoori Breads & Naans', name: 'Butter Tandoori Roti', code: 'BRD05', price: 45, type: 'VEG' as FoodType, prep: 4 },
    { cat: 'Tandoori Breads & Naans', name: 'Laccha Paratha', code: 'BRD06', price: 75, type: 'VEG' as FoodType, prep: 6 },
    { cat: 'Tandoori Breads & Naans', name: 'Amritsari Kulcha with Chana', code: 'BRD07', price: 140, type: 'VEG' as FoodType, prep: 8 },
    { cat: 'Tandoori Breads & Naans', name: 'Missi Roti', code: 'BRD08', price: 55, type: 'VEG' as FoodType, prep: 5 },

    // Chinese
    { cat: 'Indo-Chinese Delights', name: 'Chilli Paneer Dry', code: 'CHN01', price: 310, type: 'VEG' as FoodType, prep: 12 },
    { cat: 'Indo-Chinese Delights', name: 'Veg Hakka Noodles', code: 'CHN02', price: 240, type: 'VEG' as FoodType, prep: 10 },
    { cat: 'Indo-Chinese Delights', name: 'Chicken Hakka Noodles', code: 'CHN03', price: 290, type: 'NON_VEG' as FoodType, prep: 12 },
    { cat: 'Indo-Chinese Delights', name: 'Veg Fried Rice', code: 'CHN04', price: 230, type: 'VEG' as FoodType, prep: 10 },
    { cat: 'Indo-Chinese Delights', name: 'Chicken Fried Rice', code: 'CHN05', price: 280, type: 'NON_VEG' as FoodType, prep: 12 },
    { cat: 'Indo-Chinese Delights', name: 'Veg Manchurian Gravy', code: 'CHN06', price: 270, type: 'VEG' as FoodType, prep: 12 },
    { cat: 'Indo-Chinese Delights', name: 'Chilli Chicken Gravy', code: 'CHN07', price: 360, type: 'NON_VEG' as FoodType, prep: 15 },
    { cat: 'Indo-Chinese Delights', name: 'Crispy Honey Chilli Potato', code: 'CHN08', price: 220, type: 'VEG' as FoodType, prep: 10 },

    // Desserts
    { cat: 'Desserts & Sweets', name: 'Hot Gulab Jamun (2 Pcs)', code: 'DES01', price: 110, type: 'VEG' as FoodType, prep: 3 },
    { cat: 'Desserts & Sweets', name: 'Kesari Rasmalai (2 Pcs)', code: 'DES02', price: 150, type: 'VEG' as FoodType, prep: 3 },
    { cat: 'Desserts & Sweets', name: 'Sizzling Brownie with Vanilla Ice Cream', code: 'DES03', price: 220, type: 'VEG' as FoodType, prep: 7 },
    { cat: 'Desserts & Sweets', name: 'Matka Kulfi', code: 'DES04', price: 120, type: 'VEG' as FoodType, prep: 2 },
    { cat: 'Desserts & Sweets', name: 'Gajar Ka Halwa (Seasonal)', code: 'DES05', price: 160, type: 'VEG' as FoodType, prep: 5 },

    // Beverages
    { cat: 'Beverages & Mocktails', name: 'Special Mango Lassi', code: 'BEV01', price: 140, type: 'BEVERAGE' as FoodType, prep: 5 },
    { cat: 'Beverages & Mocktails', name: 'Masala Chaas (Spiced Buttermilk)', code: 'BEV02', price: 80, type: 'BEVERAGE' as FoodType, prep: 3 },
    { cat: 'Beverages & Mocktails', name: 'Fresh Lime Soda (Sweet/Salt)', code: 'BEV03', price: 90, type: 'BEVERAGE' as FoodType, prep: 3 },
    { cat: 'Beverages & Mocktails', name: 'Virgin Mojito', code: 'BEV04', price: 160, type: 'BEVERAGE' as FoodType, prep: 5 },
    { cat: 'Beverages & Mocktails', name: 'Cold Coffee with Ice Cream', code: 'BEV05', price: 170, type: 'BEVERAGE' as FoodType, prep: 5 },
    { cat: 'Beverages & Mocktails', name: 'Kulhad Masala Chai', code: 'BEV06', price: 60, type: 'BEVERAGE' as FoodType, prep: 5 },
    { cat: 'Beverages & Mocktails', name: 'Packaged Drinking Water (1L)', code: 'BEV07', price: 30, type: 'BEVERAGE' as FoodType, prep: 1 },
  ];

  for (const item of menuItems) {
    await prisma.item.create({
      data: {
        brandId: brand.id,
        categoryId: catMap[item.cat],
        taxGroupId: gst5.id,
        name: item.name,
        shortCode: item.code,
        basePrice: item.price,
        foodType: item.type,
        preparationTime: item.prep,
        isAvailable: true,
      },
    });
  }
  console.log(`✅ 60+ Authentic Indian Restaurant Items seeded across ${categoriesData.length} categories`);

  // 8. LOYALTY PROGRAM & TIERS
  const loyalty = await prisma.loyaltyProgram.upsert({
    where: { brandId: brand.id },
    update: {},
    create: {
      brandId: brand.id,
      name: 'RestoDesk Club Rewards',
      earnRulePointsPerRupee: 0.05, // 1 point per ₹20 spent
      minBillToEarn: 100,
      redeemPointValueInRupees: 1.0,
      minPointsToRedeem: 50,
      maxRedeemPercentOfBill: 50.0,
      pointsExpiryDays: 365,
    },
  });

  const tiers = [
    { name: 'Silver Member', minSpend: 0, multiplier: 1.0, perks: 'Standard 5% points earn' },
    { name: 'Gold Member', minSpend: 15000, multiplier: 1.5, perks: '1.5x points + Free dessert on birthday' },
    { name: 'Platinum VIP', minSpend: 50000, multiplier: 2.0, perks: '2x points + Priority table reservation' },
  ];

  for (const t of tiers) {
    await prisma.loyaltyTier.create({
      data: {
        loyaltyProgramId: loyalty.id,
        name: t.name,
        minSpend: t.minSpend,
        multiplier: t.multiplier,
        perksDescription: t.perks,
      },
    });
  }
  console.log('✅ Loyalty Program & 3 Tiers (Silver, Gold, Platinum) initialized');

  // 9. COUPONS & OFFERS
  const sampleCoupons = [
    {
      code: 'WELCOME50',
      title: '50% Off First Visit',
      couponType: 'PERCENTAGE' as any,
      discountValue: 50.0,
      maxDiscount: 150.0,
      minBillAmount: 300.0,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 90 * 86400000),
    },
    {
      code: 'FLAT100',
      title: 'Flat ₹100 Off on Meals',
      couponType: 'FLAT_DISCOUNT' as any,
      discountValue: 100.0,
      minBillAmount: 500.0,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 60 * 86400000),
    },
    {
      code: 'BIRYANI20',
      title: '20% Off Weekend Special',
      couponType: 'PERCENTAGE' as any,
      discountValue: 20.0,
      maxDiscount: 250.0,
      minBillAmount: 600.0,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 86400000),
    },
  ];

  for (const c of sampleCoupons) {
    await prisma.coupon.upsert({
      where: {
        brandId_code: {
          brandId: brand.id,
          code: c.code,
        },
      },
      update: {},
      create: {
        brandId: brand.id,
        ...c,
      },
    });
  }
  console.log('✅ Coupons created: WELCOME50, FLAT100, BIRYANI20');

  // 10. SAMPLE CUSTOMERS
  const sampleCustomers = [
    { name: 'Rajesh Mehta', phone: '9820123456', email: 'rajesh.mehta@gmail.com', points: 340, spend: 8900 },
    { name: 'Priya Sundaram', phone: '9845098765', email: 'priya.s@yahoo.com', points: 720, spend: 18400 },
    { name: 'Amitabh Sengupta', phone: '9830054321', email: 'amitabh.s@gmail.com', points: 1540, spend: 42100 },
    { name: 'Sneha Kulkarni', phone: '9822011223', email: 'sneha.k@outlook.com', points: 120, spend: 3200 },
    { name: 'Rohan Verma', phone: '9811099887', email: 'rohan.v@gmail.com', points: 450, spend: 12500 },
  ];

  for (const cust of sampleCustomers) {
    await prisma.customer.upsert({
      where: {
        brandId_phone: {
          brandId: brand.id,
          phone: cust.phone,
        },
      },
      update: {},
      create: {
        brandId: brand.id,
        name: cust.name,
        phone: cust.phone,
        email: cust.email,
        totalPoints: cust.points,
        totalSpend: cust.spend,
        visitCount: Math.floor(cust.spend / 1000) + 1,
        lastVisit: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000),
      },
    });
  }
  console.log('✅ Sample Customers created with loyalty ledger');

  console.log('🎉 RestoDesk Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
