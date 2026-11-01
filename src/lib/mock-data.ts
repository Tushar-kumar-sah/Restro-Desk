// Central in-memory data store for RestoDesk offline & instant preview

export let MOCK_CATEGORIES: any[] = [
  { id: 'cat-01', brandId: 'brand-restodesk-001', name: 'Tandoori & Starters', sortOrder: 1, itemCount: 10, isActive: true },
  { id: 'cat-02', brandId: 'brand-restodesk-001', name: 'Main Course (Curries)', sortOrder: 2, itemCount: 12, isActive: true },
  { id: 'cat-03', brandId: 'brand-restodesk-001', name: 'Biryani & Rice Bowls', sortOrder: 3, itemCount: 8, isActive: true },
  { id: 'cat-04', brandId: 'brand-restodesk-001', name: 'Tandoori Breads & Naans', sortOrder: 4, itemCount: 8, isActive: true },
  { id: 'cat-05', brandId: 'brand-restodesk-001', name: 'Indo-Chinese Delights', sortOrder: 5, itemCount: 8, isActive: true },
  { id: 'cat-06', brandId: 'brand-restodesk-001', name: 'Desserts & Sweets', sortOrder: 6, itemCount: 5, isActive: true },
  { id: 'cat-07', brandId: 'brand-restodesk-001', name: 'Beverages & Mocktails', sortOrder: 7, itemCount: 7, isActive: true },
];

export type ItemItem = {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  shortCode?: string | null;
  basePrice: number;
  foodType: any;
  isAvailable: boolean;
  preparationTime?: number | null;
  hsnCode?: string | null;
  description?: string | null;
  [key: string]: any;
};

export let MOCK_MENU_ITEMS: ItemItem[] = [
  // Tandoori & Starters
  { id: 'itm-01', categoryId: 'cat-01', categoryName: 'Tandoori & Starters', name: 'Paneer Tikka Angara', shortCode: 'STA01', basePrice: 340, foodType: 'VEG', isAvailable: true, preparationTime: 15, hsnCode: '2106', description: 'Cottage cheese marinated in fiery spices cooked in clay tandoor' },
  { id: 'itm-02', categoryId: 'cat-01', categoryName: 'Tandoori & Starters', name: 'Dahi Ke Kebab', shortCode: 'STA02', basePrice: 290, foodType: 'VEG', isAvailable: true, preparationTime: 12, hsnCode: '2106', description: 'Crisp hung curd kebabs with cardamom and fresh coriander' },
  { id: 'itm-03', categoryId: 'cat-01', categoryName: 'Tandoori & Starters', name: 'Malai Soya Chaap', shortCode: 'STA03', basePrice: 310, foodType: 'VEG', isAvailable: true, preparationTime: 15, hsnCode: '2106', description: 'Juicy soya chunks coated in rich cashew cream and char-grilled' },
  { id: 'itm-04', categoryId: 'cat-01', categoryName: 'Tandoori & Starters', name: 'Hara Bhara Kebab', shortCode: 'STA04', basePrice: 260, foodType: 'VEG', isAvailable: true, preparationTime: 12, hsnCode: '2106', description: 'Spinach, green peas and spiced potato patties' },
  { id: 'itm-05', categoryId: 'cat-01', categoryName: 'Tandoori & Starters', name: 'Crispy Corn Salt & Pepper', shortCode: 'STA05', basePrice: 240, foodType: 'VEG', isAvailable: true, preparationTime: 10, hsnCode: '2106', description: 'Golden fried sweet corn tossed with spring onions and crushed pepper' },
  { id: 'itm-06', categoryId: 'cat-01', categoryName: 'Tandoori & Starters', name: 'Tandoori Chicken (Half)', shortCode: 'STA06', basePrice: 360, foodType: 'NON_VEG', isAvailable: true, preparationTime: 20, hsnCode: '2106', description: 'Classic bone-in chicken marinated overnight in Kashmiri chilli and yogurt' },
  { id: 'itm-07', categoryId: 'cat-01', categoryName: 'Tandoori & Starters', name: 'Murgh Malai Tikka', shortCode: 'STA07', basePrice: 390, foodType: 'NON_VEG', isAvailable: true, preparationTime: 18, hsnCode: '2106', description: 'Boneless chicken cubes steeped in cheese, cream, cardamom and garlic' },
  { id: 'itm-08', categoryId: 'cat-01', categoryName: 'Tandoori & Starters', name: 'Bhatti Da Murgh', shortCode: 'STA08', basePrice: 380, foodType: 'NON_VEG', isAvailable: true, preparationTime: 18, hsnCode: '2106', description: 'Smoky grilled chicken tossed in rustic roasted spices' },
  { id: 'itm-09', categoryId: 'cat-01', categoryName: 'Tandoori & Starters', name: 'Amritsari Fish Fry', shortCode: 'STA09', basePrice: 440, foodType: 'NON_VEG', isAvailable: true, preparationTime: 15, hsnCode: '2106', description: 'Carom seed batter fried crispy freshwater fish fillets' },
  { id: 'itm-10', categoryId: 'cat-01', categoryName: 'Tandoori & Starters', name: 'Mutton Seekh Kebab', shortCode: 'STA10', basePrice: 460, foodType: 'NON_VEG', isAvailable: true, preparationTime: 20, hsnCode: '2106', description: 'Minced lamb skewers scented with mint, mace and smoked butter' },

  // Main Course
  { id: 'itm-11', categoryId: 'cat-02', categoryName: 'Main Course (Curries)', name: 'Paneer Butter Masala', shortCode: 'CUR01', basePrice: 360, foodType: 'VEG', isAvailable: true, preparationTime: 15, hsnCode: '2106', description: 'Velvety makhani gravy with paneer cubes and dollop of white butter' },
  { id: 'itm-12', categoryId: 'cat-02', categoryName: 'Main Course (Curries)', name: 'Dal Makhani Special', shortCode: 'CUR02', basePrice: 320, foodType: 'VEG', isAvailable: true, preparationTime: 12, hsnCode: '2106', description: 'Slow cooked black urad lentils simmered overnight for 18 hours' },
  { id: 'itm-13', categoryId: 'cat-02', categoryName: 'Main Course (Curries)', name: 'Kadai Paneer', shortCode: 'CUR03', basePrice: 350, foodType: 'VEG', isAvailable: true, preparationTime: 15, hsnCode: '2106', description: 'Cottage cheese with capsicum in roasted whole coriander gravy' },
  { id: 'itm-14', categoryId: 'cat-02', categoryName: 'Main Course (Curries)', name: 'Palak Paneer', shortCode: 'CUR04', basePrice: 340, foodType: 'VEG', isAvailable: true, preparationTime: 15, hsnCode: '2106', description: 'Fresh farm spinach puree tempered with garlic and cottage cheese' },
  { id: 'itm-15', categoryId: 'cat-02', categoryName: 'Main Course (Curries)', name: 'Shahi Malai Kofta', shortCode: 'CUR05', basePrice: 380, foodType: 'VEG', isAvailable: true, preparationTime: 18, hsnCode: '2106', description: 'Stuffed paneer-khoya dumplings in fragrant cashew nut gravy' },
  { id: 'itm-16', categoryId: 'cat-02', categoryName: 'Main Course (Curries)', name: 'Pindi Chana Masala', shortCode: 'CUR06', basePrice: 280, foodType: 'VEG', isAvailable: true, preparationTime: 12, hsnCode: '2106', description: 'Traditional dark chickpeas tossed with amchur and whole spices' },
  { id: 'itm-17', categoryId: 'cat-02', categoryName: 'Main Course (Curries)', name: 'Yellow Dal Tadka', shortCode: 'CUR07', basePrice: 240, foodType: 'VEG', isAvailable: true, preparationTime: 10, hsnCode: '2106', description: 'Yellow arhar lentils tempered with desi ghee, cumin and green chillies' },
  { id: 'itm-18', categoryId: 'cat-02', categoryName: 'Main Course (Curries)', name: 'Butter Chicken Old Delhi Style', shortCode: 'CUR08', basePrice: 420, foodType: 'NON_VEG', isAvailable: true, preparationTime: 18, hsnCode: '2106', description: 'Tandoori chicken shredded into rich tomato-cashew satin gravy with fenugreek' },
  { id: 'itm-19', categoryId: 'cat-02', categoryName: 'Main Course (Curries)', name: 'Chicken Tikka Masala', shortCode: 'CUR09', basePrice: 410, foodType: 'NON_VEG', isAvailable: true, preparationTime: 18, hsnCode: '2106', description: 'Charred chicken tikka chunks in onion-tomato masala with bell peppers' },
  { id: 'itm-20', categoryId: 'cat-02', categoryName: 'Main Course (Curries)', name: 'Kadai Chicken', shortCode: 'CUR10', basePrice: 390, foodType: 'NON_VEG', isAvailable: true, preparationTime: 18, hsnCode: '2106', description: 'Spiced chicken cooked with crunchy peppers in wok gravy' },
  { id: 'itm-21', categoryId: 'cat-02', categoryName: 'Main Course (Curries)', name: 'Mutton Rogan Josh', shortCode: 'CUR11', basePrice: 540, foodType: 'NON_VEG', isAvailable: true, preparationTime: 22, hsnCode: '2106', description: 'Kashmiri tender lamb simmered in ratanjyot bark and aromatic saffron' },
  { id: 'itm-22', categoryId: 'cat-02', categoryName: 'Main Course (Curries)', name: 'Bengali Fish Curry', shortCode: 'CUR12', basePrice: 460, foodType: 'NON_VEG', isAvailable: true, preparationTime: 18, hsnCode: '2106', description: 'Mustard oil and panch phoron tempered spicy fish gravy' },

  // Biryani & Rice
  { id: 'itm-23', categoryId: 'cat-03', categoryName: 'Biryani & Rice Bowls', name: 'Hyderabadi Chicken Dum Biryani', shortCode: 'BIR01', basePrice: 380, foodType: 'NON_VEG', isAvailable: true, preparationTime: 15, hsnCode: '2106', description: 'Aged basmati rice sealed with marinated chicken and saffron ghee' },
  { id: 'itm-24', categoryId: 'cat-03', categoryName: 'Biryani & Rice Bowls', name: 'Royal Mutton Biryani', shortCode: 'BIR02', basePrice: 490, foodType: 'NON_VEG', isAvailable: true, preparationTime: 18, hsnCode: '2106', description: 'Slow cooked tender mutton cuts layered with long-grain rice' },
  { id: 'itm-25', categoryId: 'cat-03', categoryName: 'Biryani & Rice Bowls', name: 'Lucknowi Veg Dum Biryani', shortCode: 'BIR03', basePrice: 310, foodType: 'VEG', isAvailable: true, preparationTime: 15, hsnCode: '2106', description: 'Garden fresh veggies and paneer in fragrant Awadhi spiced rice' },
  { id: 'itm-26', categoryId: 'cat-03', categoryName: 'Biryani & Rice Bowls', name: 'Paneer Tikka Biryani', shortCode: 'BIR04', basePrice: 340, foodType: 'VEG', isAvailable: true, preparationTime: 15, hsnCode: '2106', description: 'Smoky grilled paneer chunks tossed with aromatic dum rice' },
  { id: 'itm-27', categoryId: 'cat-03', categoryName: 'Biryani & Rice Bowls', name: 'Egg Biryani (2 Eggs)', shortCode: 'BIR05', basePrice: 290, foodType: 'EGG', isAvailable: true, preparationTime: 12, hsnCode: '2106', description: 'Crispy fried boiled eggs in biryani masala with raita' },
  { id: 'itm-28', categoryId: 'cat-03', categoryName: 'Biryani & Rice Bowls', name: 'Jeera Rice with Desi Ghee', shortCode: 'BIR06', basePrice: 190, foodType: 'VEG', isAvailable: true, preparationTime: 8, hsnCode: '2106', description: 'Basmati rice tempered with roasted cumin seeds and ghee' },
  { id: 'itm-29', categoryId: 'cat-03', categoryName: 'Biryani & Rice Bowls', name: 'Steamed Basmati Rice', shortCode: 'BIR07', basePrice: 150, foodType: 'VEG', isAvailable: true, preparationTime: 5, hsnCode: '2106', description: 'Fluffy extra long steamed grain rice' },
  { id: 'itm-30', categoryId: 'cat-03', categoryName: 'Biryani & Rice Bowls', name: 'Veg Pulao with Raita', shortCode: 'BIR08', basePrice: 220, foodType: 'VEG', isAvailable: true, preparationTime: 10, hsnCode: '2106', description: 'Basmati rice cooked with fresh vegetables and whole aromatics' },

  // Breads
  { id: 'itm-31', categoryId: 'cat-04', categoryName: 'Tandoori Breads & Naans', name: 'Butter Naan', shortCode: 'BRD01', basePrice: 65, foodType: 'VEG', isAvailable: true, preparationTime: 5, hsnCode: '1905', description: 'Clay oven baked flatbread brushed with salted butter' },
  { id: 'itm-32', categoryId: 'cat-04', categoryName: 'Tandoori Breads & Naans', name: 'Garlic Butter Naan', shortCode: 'BRD02', basePrice: 85, foodType: 'VEG', isAvailable: true, preparationTime: 6, hsnCode: '1905', description: 'Naan topped with chopped roasted garlic and fresh coriander' },
  { id: 'itm-33', categoryId: 'cat-04', categoryName: 'Tandoori Breads & Naans', name: 'Cheese Garlic Naan', shortCode: 'BRD03', basePrice: 120, foodType: 'VEG', isAvailable: true, preparationTime: 8, hsnCode: '1905', description: 'Naan stuffed with gooey mozzarella and fresh garlic' },
  { id: 'itm-34', categoryId: 'cat-04', categoryName: 'Tandoori Breads & Naans', name: 'Tandoori Roti (Plain)', shortCode: 'BRD04', basePrice: 35, foodType: 'VEG', isAvailable: true, preparationTime: 4, hsnCode: '1905', description: 'Whole wheat roti baked in traditional tandoor' },
  { id: 'itm-35', categoryId: 'cat-04', categoryName: 'Tandoori Breads & Naans', name: 'Butter Tandoori Roti', shortCode: 'BRD05', basePrice: 45, foodType: 'VEG', isAvailable: true, preparationTime: 4, hsnCode: '1905', description: 'Tandoori wheat roti glazed with butter' },
  { id: 'itm-36', categoryId: 'cat-04', categoryName: 'Tandoori Breads & Naans', name: 'Laccha Paratha', shortCode: 'BRD06', basePrice: 75, foodType: 'VEG', isAvailable: true, preparationTime: 6, hsnCode: '1905', description: 'Multi-layered flaky crispy tandoor bread' },
  { id: 'itm-37', categoryId: 'cat-04', categoryName: 'Tandoori Breads & Naans', name: 'Amritsari Kulcha with Chana', shortCode: 'BRD07', basePrice: 140, foodType: 'VEG', isAvailable: true, preparationTime: 8, hsnCode: '1905', description: 'Spiced potato and onion stuffed crisp kulcha' },
  { id: 'itm-38', categoryId: 'cat-04', categoryName: 'Tandoori Breads & Naans', name: 'Missi Roti', shortCode: 'BRD08', basePrice: 55, foodType: 'VEG', isAvailable: true, preparationTime: 5, hsnCode: '1905', description: 'Gram flour roti with onions, ajwain and kasoori methi' },

  // Chinese
  { id: 'itm-39', categoryId: 'cat-05', categoryName: 'Indo-Chinese Delights', name: 'Chilli Paneer Dry', shortCode: 'CHN01', basePrice: 310, foodType: 'VEG', isAvailable: true, preparationTime: 12, hsnCode: '2106', description: 'Crisp paneer cubes wok tossed with soya, garlic and chillies' },
  { id: 'itm-40', categoryId: 'cat-05', categoryName: 'Indo-Chinese Delights', name: 'Veg Hakka Noodles', shortCode: 'CHN02', basePrice: 240, foodType: 'VEG', isAvailable: true, preparationTime: 10, hsnCode: '2106', description: 'Wok tossed noodles with shredded crunchy vegetables' },
  { id: 'itm-41', categoryId: 'cat-05', categoryName: 'Indo-Chinese Delights', name: 'Chicken Hakka Noodles', shortCode: 'CHN03', basePrice: 290, foodType: 'NON_VEG', isAvailable: true, preparationTime: 12, hsnCode: '2106', description: 'Egg noodles with chicken shreds, bell peppers and scallions' },
  { id: 'itm-42', categoryId: 'cat-05', categoryName: 'Indo-Chinese Delights', name: 'Veg Fried Rice', shortCode: 'CHN04', basePrice: 230, foodType: 'VEG', isAvailable: true, preparationTime: 10, hsnCode: '2106', description: 'Fragrant rice stir fried with finely chopped vegetables' },
  { id: 'itm-43', categoryId: 'cat-05', categoryName: 'Indo-Chinese Delights', name: 'Chicken Fried Rice', shortCode: 'CHN05', basePrice: 280, foodType: 'NON_VEG', isAvailable: true, preparationTime: 12, hsnCode: '2106', description: 'Stir fried rice with diced chicken, eggs and garlic' },
  { id: 'itm-44', categoryId: 'cat-05', categoryName: 'Indo-Chinese Delights', name: 'Veg Manchurian Gravy', shortCode: 'CHN06', basePrice: 270, foodType: 'VEG', isAvailable: true, preparationTime: 12, hsnCode: '2106', description: 'Golden vegetable balls in rich ginger garlic coriander sauce' },
  { id: 'itm-45', categoryId: 'cat-05', categoryName: 'Indo-Chinese Delights', name: 'Chilli Chicken Gravy', shortCode: 'CHN07', basePrice: 360, foodType: 'NON_VEG', isAvailable: true, preparationTime: 15, hsnCode: '2106', description: 'Boneless batter fried chicken in hot garlic soya sauce' },
  { id: 'itm-46', categoryId: 'cat-05', categoryName: 'Indo-Chinese Delights', name: 'Crispy Honey Chilli Potato', shortCode: 'CHN08', basePrice: 220, foodType: 'VEG', isAvailable: true, preparationTime: 10, hsnCode: '2106', description: 'Crisp potato fingers glazed with honey and toasted sesame' },

  // Desserts
  { id: 'itm-47', categoryId: 'cat-06', categoryName: 'Desserts & Sweets', name: 'Hot Gulab Jamun (2 Pcs)', shortCode: 'DES01', basePrice: 110, foodType: 'VEG', isAvailable: true, preparationTime: 3, hsnCode: '2106', description: 'Khoya dumplings steeped in warm rose-cardamom syrup' },
  { id: 'itm-48', categoryId: 'cat-06', categoryName: 'Desserts & Sweets', name: 'Kesari Rasmalai (2 Pcs)', shortCode: 'DES02', basePrice: 150, foodType: 'VEG', isAvailable: true, preparationTime: 3, hsnCode: '2106', description: 'Spongy cottage cheese patties in saffron-pistachio thickened milk' },
  { id: 'itm-49', categoryId: 'cat-06', categoryName: 'Desserts & Sweets', name: 'Sizzling Brownie with Ice Cream', shortCode: 'DES03', basePrice: 220, foodType: 'VEG', isAvailable: true, preparationTime: 7, hsnCode: '2106', description: 'Warm walnut brownie on iron sizzler plate with vanilla scoop' },
  { id: 'itm-50', categoryId: 'cat-06', categoryName: 'Desserts & Sweets', name: 'Matka Kulfi', shortCode: 'DES04', basePrice: 120, foodType: 'VEG', isAvailable: true, preparationTime: 2, hsnCode: '2106', description: 'Traditional clay pot kulfi with almond slivers' },
  { id: 'itm-51', categoryId: 'cat-06', categoryName: 'Desserts & Sweets', name: 'Gajar Ka Halwa (Seasonal)', shortCode: 'DES05', basePrice: 160, foodType: 'VEG', isAvailable: true, preparationTime: 5, hsnCode: '2106', description: 'Grated red carrots cooked in milk, khoya and pure ghee' },

  // Beverages
  { id: 'itm-52', categoryId: 'cat-07', categoryName: 'Beverages & Mocktails', name: 'Special Mango Lassi', shortCode: 'BEV01', basePrice: 140, foodType: 'BEVERAGE', isAvailable: true, preparationTime: 5, hsnCode: '2202', description: 'Rich Alphonso mango pulp blended with thick sweet curd' },
  { id: 'itm-53', categoryId: 'cat-07', categoryName: 'Beverages & Mocktails', name: 'Masala Chaas (Spiced Buttermilk)', shortCode: 'BEV02', basePrice: 80, foodType: 'BEVERAGE', isAvailable: true, preparationTime: 3, hsnCode: '2202', description: 'Refreshing churned buttermilk with ginger, mint and roasted cumin' },
  { id: 'itm-54', categoryId: 'cat-07', categoryName: 'Beverages & Mocktails', name: 'Fresh Lime Soda (Sweet/Salt)', shortCode: 'BEV03', basePrice: 90, foodType: 'BEVERAGE', isAvailable: true, preparationTime: 3, hsnCode: '2202', description: 'Freshly squeezed lemon juice topped with chilled soda' },
  { id: 'itm-55', categoryId: 'cat-07', categoryName: 'Beverages & Mocktails', name: 'Virgin Mojito', shortCode: 'BEV04', basePrice: 160, foodType: 'BEVERAGE', isAvailable: true, preparationTime: 5, hsnCode: '2202', description: 'Muddled mint leaves, lime chunks, sugar syrup and fizz' },
  { id: 'itm-56', categoryId: 'cat-07', categoryName: 'Beverages & Mocktails', name: 'Cold Coffee with Ice Cream', shortCode: 'BEV05', basePrice: 170, foodType: 'BEVERAGE', isAvailable: true, preparationTime: 5, hsnCode: '2202', description: 'Brewed coffee blended with milk and vanilla ice cream scoop' },
  { id: 'itm-57', categoryId: 'cat-07', categoryName: 'Beverages & Mocktails', name: 'Kulhad Masala Chai', shortCode: 'BEV06', basePrice: 60, foodType: 'BEVERAGE', isAvailable: true, preparationTime: 5, hsnCode: '2202', description: 'Clay cup tea brewed with crushed ginger, cardamom and cinnamon' },
  { id: 'itm-58', categoryId: 'cat-07', categoryName: 'Beverages & Mocktails', name: 'Packaged Drinking Water (1L)', shortCode: 'BEV07', basePrice: 30, foodType: 'BEVERAGE', isAvailable: true, preparationTime: 1, hsnCode: '2201', description: 'Premium mineral water bottle' },
];

export let MOCK_ITEMS = MOCK_MENU_ITEMS;

export let MOCK_OUTLETS = [
  {
    id: 'outlet-01',
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
    defaultGstPercent: 5.0,
    isActive: true,
  },
  {
    id: 'outlet-02',
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
    defaultGstPercent: 5.0,
    isActive: true,
  },
  {
    id: 'outlet-03',
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
    defaultGstPercent: 5.0,
    isActive: true,
  },
];

export let MOCK_ADDON_GROUPS: any[] = [
  {
    id: 'grp-01',
    name: 'Spice Level',
    minSelect: 1,
    maxSelect: 1,
    isRequired: true,
    addons: [
      { id: 'add-01', name: 'Mild (Less Spicy)', price: 0, isVeg: true },
      { id: 'add-02', name: 'Medium Regular', price: 0, isVeg: true },
      { id: 'add-03', name: 'Desi Spicy (Hot)', price: 0, isVeg: true },
    ],
  },
  {
    id: 'grp-02',
    name: 'Add-ons & Toppings',
    minSelect: 0,
    maxSelect: 3,
    isRequired: false,
    addons: [
      { id: 'add-04', name: 'Extra Amul Butter', price: 30, isVeg: true },
      { id: 'add-05', name: 'Extra Mozzarella Cheese', price: 50, isVeg: true },
      { id: 'add-06', name: 'Boondi Raita (100ml)', price: 60, isVeg: true },
      { id: 'add-07', name: 'Mint Chutney & Sirka Onion', price: 20, isVeg: true },
    ],
  },
  {
    id: 'grp-03',
    name: 'Portion Size',
    minSelect: 1,
    maxSelect: 1,
    isRequired: true,
    addons: [
      { id: 'add-08', name: 'Regular Portion', price: 0, isVeg: true },
      { id: 'add-09', name: 'Family Pack (Serves 3-4)', price: 220, isVeg: true },
    ],
  },
];

export let MOCK_COMBOS: any[] = [
  {
    id: 'cmb-01',
    name: 'Royal Biryani Feast (For 2)',
    description: '1 Hyderabadi Chicken Biryani + 1 Murgh Malai Tikka + 2 Butter Naan + 2 Mango Lassi',
    price: 899.0,
    originalPrice: 1060.0,
    isAvailable: true,
    itemCount: 4,
  },
  {
    id: 'cmb-02',
    name: 'Vegetarian Maharaja Thali Combo',
    description: 'Paneer Butter Masala + Dal Makhani + 2 Butter Roti + Jeera Rice + Gulab Jamun',
    price: 499.0,
    originalPrice: 620.0,
    isAvailable: true,
    itemCount: 5,
  },
  {
    id: 'cmb-03',
    name: 'Indo-Chinese Party Platter',
    description: 'Veg Hakka Noodles + Chilli Paneer Dry + Crispy Honey Chilli Potato + 2 Cold Coffee',
    price: 749.0,
    originalPrice: 910.0,
    isAvailable: true,
    itemCount: 4,
  },
];

export let MOCK_ORDERS: any[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-20261028-101',
    dailyOrderSequence: 101,
    orderType: 'DINE_IN',
    status: 'PREPARING',
    tableNumber: 'T-04',
    customerName: 'Rajesh Mehta',
    customerPhone: '9820123456',
    subtotal: 1350.0,
    discountAmount: 0.0,
    discountPercent: 0.0,
    cgstAmount: 33.75,
    sgstAmount: 33.75,
    taxAmount: 67.5,
    serviceCharge: 0.0,
    packagingCharge: 0.0,
    deliveryCharge: 0.0,
    roundOff: -0.25,
    totalAmount: 1417.0,
    paidAmount: 0.0,
    balanceAmount: 1417.0,
    paymentStatus: 'UNPAID',
    kotNumber: 'KOT-201',
    createdAt: new Date(Date.now() - 15 * 60000),
    items: [
      { name: 'Paneer Butter Masala', quantity: 2, unitPrice: 360, totalPrice: 720 },
      { name: 'Garlic Butter Naan', quantity: 4, unitPrice: 85, totalPrice: 340 },
      { name: 'Special Mango Lassi', quantity: 2, unitPrice: 145, totalPrice: 290 },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-20261028-102',
    dailyOrderSequence: 102,
    orderType: 'DINE_IN',
    status: 'BILLED',
    tableNumber: 'T-09',
    customerName: 'Priya Sundaram',
    customerPhone: '9845098765',
    subtotal: 1890.0,
    discountAmount: 100.0,
    discountReason: 'FLAT100 Coupon',
    cgstAmount: 44.75,
    sgstAmount: 44.75,
    taxAmount: 89.5,
    roundOff: 0.25,
    totalAmount: 1880.0,
    paidAmount: 0.0,
    balanceAmount: 1880.0,
    paymentStatus: 'UNPAID',
    kotNumber: 'KOT-202',
    createdAt: new Date(Date.now() - 35 * 60000),
    items: [
      { itemId: 'menu-cur-03', name: 'Butter Chicken Old Delhi Style', quantity: 2, unitPrice: 420, totalPrice: 840, foodType: 'NON_VEG' },
      { itemId: 'menu-bir-01', name: 'Hyderabadi Chicken Dum Biryani', quantity: 2, unitPrice: 380, totalPrice: 760, foodType: 'NON_VEG' },
      { itemId: 'menu-brd-01', name: 'Butter Naan', quantity: 4, unitPrice: 65, totalPrice: 260, foodType: 'VEG' },
      { itemId: 'menu-des-01', name: 'Hot Gulab Jamun (2 Pcs)', quantity: 1, unitPrice: 110, totalPrice: 110, foodType: 'VEG' },
    ],
  },
  {
    id: 'ord-103',
    orderNumber: 'ORD-20261028-103',
    dailyOrderSequence: 103,
    orderType: 'DINE_IN',
    status: 'PREPARING',
    tableNumber: 'T-01',
    customerName: 'Kunal Kapoor',
    customerPhone: '9876543210',
    subtotal: 680.0,
    discountAmount: 0.0,
    discountPercent: 0.0,
    cgstAmount: 0.0,
    sgstAmount: 0.0,
    taxAmount: 0.0,
    serviceCharge: 0.0,
    packagingCharge: 0.0,
    deliveryCharge: 0.0,
    roundOff: 0.0,
    totalAmount: 680.0,
    paidAmount: 0.0,
    balanceAmount: 680.0,
    paymentStatus: 'UNPAID',
    kotNumber: 'KOT-203',
    createdAt: new Date(Date.now() - 25 * 60000),
    items: [
      { itemId: 'menu-cur-01', name: 'Paneer Butter Masala', quantity: 1, unitPrice: 360, totalPrice: 360, foodType: 'VEG' },
      { itemId: 'menu-cur-02', name: 'Dal Makhani Special', quantity: 1, unitPrice: 320, totalPrice: 320, foodType: 'VEG' },
    ],
  },
  {
    id: 'ord-104',
    orderNumber: 'ORD-20261028-104',
    dailyOrderSequence: 104,
    orderType: 'DINE_IN',
    status: 'PREPARING',
    tableNumber: 'T-03',
    customerName: 'Sanjay Gupta',
    customerPhone: '9811234567',
    subtotal: 1240.0,
    discountAmount: 0.0,
    discountPercent: 0.0,
    cgstAmount: 0.0,
    sgstAmount: 0.0,
    taxAmount: 0.0,
    serviceCharge: 0.0,
    packagingCharge: 0.0,
    deliveryCharge: 0.0,
    roundOff: 0.0,
    totalAmount: 1240.0,
    paidAmount: 0.0,
    balanceAmount: 1240.0,
    paymentStatus: 'UNPAID',
    kotNumber: 'KOT-204',
    createdAt: new Date(Date.now() - 40 * 60000),
    items: [
      { itemId: 'menu-tnd-03', name: 'Murgh Malai Tikka', quantity: 2, unitPrice: 390, totalPrice: 780, foodType: 'NON_VEG' },
      { itemId: 'menu-tnd-06', name: 'Mutton Seekh Kebab', quantity: 1, unitPrice: 460, totalPrice: 460, foodType: 'NON_VEG' },
    ],
  },
  {
    id: 'ord-105',
    orderNumber: 'ORD-20261028-105',
    dailyOrderSequence: 105,
    orderType: 'DINE_IN',
    status: 'PREPARING',
    tableNumber: 'T-06',
    customerName: 'Alok Sharma (Fam)',
    customerPhone: '9822334455',
    subtotal: 2480.0,
    discountAmount: 0.0,
    discountPercent: 0.0,
    cgstAmount: 0.0,
    sgstAmount: 0.0,
    taxAmount: 0.0,
    serviceCharge: 0.0,
    packagingCharge: 0.0,
    deliveryCharge: 0.0,
    roundOff: 0.0,
    totalAmount: 2480.0,
    paidAmount: 0.0,
    balanceAmount: 2480.0,
    paymentStatus: 'UNPAID',
    kotNumber: 'KOT-205',
    createdAt: new Date(Date.now() - 55 * 60000),
    items: [
      { itemId: 'menu-cur-03', name: 'Butter Chicken Old Delhi Style', quantity: 2, unitPrice: 420, totalPrice: 840, foodType: 'NON_VEG' },
      { itemId: 'menu-bir-01', name: 'Hyderabadi Chicken Dum Biryani', quantity: 2, unitPrice: 380, totalPrice: 760, foodType: 'NON_VEG' },
      { itemId: 'menu-app-03', name: 'Amritsari Fish Fry', quantity: 2, unitPrice: 440, totalPrice: 880, foodType: 'NON_VEG' },
    ],
  },
  {
    id: 'ord-106',
    orderNumber: 'ORD-20261028-106',
    dailyOrderSequence: 106,
    orderType: 'DINE_IN',
    status: 'PREPARING',
    tableNumber: 'T-11',
    customerName: 'Aman & Neha',
    customerPhone: '9899001122',
    subtotal: 920.0,
    discountAmount: 0.0,
    discountPercent: 0.0,
    cgstAmount: 0.0,
    sgstAmount: 0.0,
    taxAmount: 0.0,
    serviceCharge: 0.0,
    packagingCharge: 0.0,
    deliveryCharge: 0.0,
    roundOff: 0.0,
    totalAmount: 920.0,
    paidAmount: 0.0,
    balanceAmount: 920.0,
    paymentStatus: 'UNPAID',
    kotNumber: 'KOT-206',
    createdAt: new Date(Date.now() - 18 * 60000),
    items: [
      { itemId: 'menu-tnd-02', name: 'Tandoori Chicken (Half)', quantity: 2, unitPrice: 360, totalPrice: 720, foodType: 'NON_VEG' },
      { itemId: 'menu-bev-01', name: 'Fresh Lime Soda (Sweet/Salt)', quantity: 2, unitPrice: 100, totalPrice: 200, foodType: 'BEVERAGE' },
    ],
  },
  {
    id: 'ord-107',
    orderNumber: 'ORD-20261028-107',
    dailyOrderSequence: 107,
    orderType: 'DINE_IN',
    status: 'PREPARING',
    tableNumber: 'T-13',
    customerName: 'Dr. Vivek',
    customerPhone: '9877665544',
    subtotal: 1650.0,
    discountAmount: 0.0,
    discountPercent: 0.0,
    cgstAmount: 0.0,
    sgstAmount: 0.0,
    taxAmount: 0.0,
    serviceCharge: 0.0,
    packagingCharge: 0.0,
    deliveryCharge: 0.0,
    roundOff: 0.0,
    totalAmount: 1650.0,
    paidAmount: 0.0,
    balanceAmount: 1650.0,
    paymentStatus: 'UNPAID',
    kotNumber: 'KOT-207',
    createdAt: new Date(Date.now() - 32 * 60000),
    items: [
      { itemId: 'menu-cur-04', name: 'Kadai Paneer', quantity: 3, unitPrice: 350, totalPrice: 1050, foodType: 'VEG' },
      { itemId: 'menu-bev-02', name: 'Special Mango Lassi', quantity: 4, unitPrice: 150, totalPrice: 600, foodType: 'BEVERAGE' },
    ],
  },
  {
    id: 'ord-108',
    orderNumber: 'ORD-20261028-108',
    dailyOrderSequence: 108,
    orderType: 'DINE_IN',
    status: 'PREPARING',
    tableNumber: 'T-15',
    customerName: 'Infosys Team',
    customerPhone: '9844332211',
    subtotal: 3120.0,
    discountAmount: 0.0,
    discountPercent: 0.0,
    cgstAmount: 0.0,
    sgstAmount: 0.0,
    taxAmount: 0.0,
    serviceCharge: 0.0,
    packagingCharge: 0.0,
    deliveryCharge: 0.0,
    roundOff: 0.0,
    totalAmount: 3120.0,
    paidAmount: 0.0,
    balanceAmount: 3120.0,
    paymentStatus: 'UNPAID',
    kotNumber: 'KOT-208',
    createdAt: new Date(Date.now() - 70 * 60000),
    items: [
      { itemId: 'menu-bir-02', name: 'Royal Mutton Biryani', quantity: 4, unitPrice: 490, totalPrice: 1960, foodType: 'NON_VEG' },
      { itemId: 'menu-tnd-04', name: 'Bhatti Da Murgh', quantity: 2, unitPrice: 380, totalPrice: 760, foodType: 'NON_VEG' },
      { itemId: 'menu-app-02', name: 'Malai Soya Chaap', quantity: 1, unitPrice: 400, totalPrice: 400, foodType: 'VEG' },
    ],
  },
  {
    id: 'ord-109',
    orderNumber: 'ORD-20261028-109',
    dailyOrderSequence: 109,
    orderType: 'DINE_IN',
    status: 'BILLED',
    tableNumber: 'T-16',
    customerName: 'Gaurav Gill',
    customerPhone: '9811882233',
    subtotal: 2840.0,
    discountAmount: 0.0,
    discountPercent: 0.0,
    cgstAmount: 0.0,
    sgstAmount: 0.0,
    taxAmount: 0.0,
    serviceCharge: 0.0,
    packagingCharge: 0.0,
    deliveryCharge: 0.0,
    roundOff: 0.0,
    totalAmount: 2840.0,
    paidAmount: 0.0,
    balanceAmount: 2840.0,
    paymentStatus: 'UNPAID',
    kotNumber: 'KOT-209',
    createdAt: new Date(Date.now() - 80 * 60000),
    items: [
      { itemId: 'menu-cur-05', name: 'Chicken Tikka Masala', quantity: 4, unitPrice: 410, totalPrice: 1640, foodType: 'NON_VEG' },
      { itemId: 'menu-cur-06', name: 'Bengali Fish Curry', quantity: 2, unitPrice: 460, totalPrice: 920, foodType: 'NON_VEG' },
      { itemId: 'menu-brd-01', name: 'Butter Naan', quantity: 4, unitPrice: 70, totalPrice: 280, foodType: 'VEG' },
    ],
  },
  {
    id: 'ord-110',
    orderNumber: 'ORD-20261028-110',
    dailyOrderSequence: 110,
    orderType: 'DINE_IN',
    status: 'PREPARING',
    tableNumber: 'T-17',
    customerName: 'Tanvi Shah',
    customerPhone: '9833445566',
    subtotal: 1100.0,
    discountAmount: 0.0,
    discountPercent: 0.0,
    cgstAmount: 0.0,
    sgstAmount: 0.0,
    taxAmount: 0.0,
    serviceCharge: 0.0,
    packagingCharge: 0.0,
    deliveryCharge: 0.0,
    roundOff: 0.0,
    totalAmount: 1100.0,
    paidAmount: 0.0,
    balanceAmount: 1100.0,
    paymentStatus: 'UNPAID',
    kotNumber: 'KOT-210',
    createdAt: new Date(Date.now() - 20 * 60000),
    items: [
      { itemId: 'menu-cur-07', name: 'Palak Paneer', quantity: 2, unitPrice: 340, totalPrice: 680, foodType: 'VEG' },
      { itemId: 'menu-app-04', name: 'Crispy Corn Salt & Pepper', quantity: 1, unitPrice: 240, totalPrice: 240, foodType: 'VEG' },
      { itemId: 'menu-brd-02', name: 'Garlic Butter Naan', quantity: 2, unitPrice: 90, totalPrice: 180, foodType: 'VEG' },
    ],
  },
  {
    id: 'ord-111',
    orderNumber: 'ORD-20261028-111',
    dailyOrderSequence: 111,
    orderType: 'DINE_IN',
    status: 'PREPARING',
    tableNumber: 'T-19',
    customerName: 'Rohan Mehra',
    customerPhone: '9866778899',
    subtotal: 850.0,
    discountAmount: 0.0,
    discountPercent: 0.0,
    cgstAmount: 0.0,
    sgstAmount: 0.0,
    taxAmount: 0.0,
    serviceCharge: 0.0,
    packagingCharge: 0.0,
    deliveryCharge: 0.0,
    roundOff: 0.0,
    totalAmount: 850.0,
    paidAmount: 0.0,
    balanceAmount: 850.0,
    paymentStatus: 'UNPAID',
    kotNumber: 'KOT-211',
    createdAt: new Date(Date.now() - 10 * 60000),
    items: [
      { itemId: 'menu-cur-08', name: 'Shahi Malai Kofta', quantity: 2, unitPrice: 380, totalPrice: 760, foodType: 'VEG' },
      { itemId: 'menu-bev-03', name: 'Fresh Lime Soda (Sweet/Salt)', quantity: 1, unitPrice: 90, totalPrice: 90, foodType: 'BEVERAGE' },
    ],
  },
];

export let HELD_BILLS: any[] = [];

// ----------------------------------------------------
// PHASE 3: SECTIONS, 20 TABLES, RESERVATIONS & KDS
// ----------------------------------------------------

export let MOCK_SECTIONS: any[] = [
  { id: 'sec-01', name: 'Ground Floor AC Dining', floorNumber: 1, tableCount: 10 },
  { id: 'sec-02', name: 'First Floor Rooftop Lounge', floorNumber: 2, tableCount: 6 },
  { id: 'sec-03', name: 'Outdoor Garden Patio', floorNumber: 1, tableCount: 4 },
];

export let MOCK_TABLES: any[] = [
  // AC Dining (T-01 to T-10)
  { id: 'tbl-01', sectionId: 'sec-01', sectionName: 'Ground Floor AC Dining', tableNumber: 'T-01', capacity: 2, status: 'RUNNING', runningAmount: 680.0, seatedAt: new Date(Date.now() - 25 * 60000), currentOrderId: 'ord-103', guestName: 'Kunal Kapoor', posX: 40, posY: 40 },
  { id: 'tbl-02', sectionId: 'sec-01', sectionName: 'Ground Floor AC Dining', tableNumber: 'T-02', capacity: 2, status: 'VACANT', runningAmount: 0, seatedAt: null, currentOrderId: null, posX: 160, posY: 40 },
  { id: 'tbl-03', sectionId: 'sec-01', sectionName: 'Ground Floor AC Dining', tableNumber: 'T-03', capacity: 4, status: 'RUNNING', runningAmount: 1240.0, seatedAt: new Date(Date.now() - 40 * 60000), currentOrderId: 'ord-104', guestName: 'Sanjay Gupta', posX: 280, posY: 40 },
  { id: 'tbl-04', sectionId: 'sec-01', sectionName: 'Ground Floor AC Dining', tableNumber: 'T-04', capacity: 4, status: 'RUNNING', runningAmount: 1417.0, seatedAt: new Date(Date.now() - 15 * 60000), currentOrderId: 'ord-101', guestName: 'Rajesh Mehta', posX: 400, posY: 40 },
  { id: 'tbl-05', sectionId: 'sec-01', sectionName: 'Ground Floor AC Dining', tableNumber: 'T-05', capacity: 6, status: 'VACANT', runningAmount: 0, seatedAt: null, currentOrderId: null, posX: 40, posY: 160 },
  { id: 'tbl-06', sectionId: 'sec-01', sectionName: 'Ground Floor AC Dining', tableNumber: 'T-06', capacity: 6, status: 'RUNNING', runningAmount: 2480.0, seatedAt: new Date(Date.now() - 55 * 60000), currentOrderId: 'ord-105', guestName: 'Alok Sharma (Fam)', posX: 160, posY: 160 },
  { id: 'tbl-07', sectionId: 'sec-01', sectionName: 'Ground Floor AC Dining', tableNumber: 'T-07', capacity: 4, status: 'VACANT', runningAmount: 0, seatedAt: null, currentOrderId: null, posX: 280, posY: 160 },
  { id: 'tbl-08', sectionId: 'sec-01', sectionName: 'Ground Floor AC Dining', tableNumber: 'T-08', capacity: 4, status: 'RESERVED', runningAmount: 0, seatedAt: null, reservationTime: '8:30 PM', guestName: 'Anand Mahindra', posX: 400, posY: 160 },
  { id: 'tbl-09', sectionId: 'sec-01', sectionName: 'Ground Floor AC Dining', tableNumber: 'T-09', capacity: 8, status: 'BILLED', runningAmount: 1880.0, seatedAt: new Date(Date.now() - 65 * 60000), currentOrderId: 'ord-102', guestName: 'Priya Sundaram', posX: 40, posY: 280 },
  { id: 'tbl-10', sectionId: 'sec-01', sectionName: 'Ground Floor AC Dining', tableNumber: 'T-10', capacity: 8, status: 'VACANT', runningAmount: 0, seatedAt: null, currentOrderId: null, posX: 280, posY: 280 },

  // Rooftop Lounge (T-11 to T-16)
  { id: 'tbl-11', sectionId: 'sec-02', sectionName: 'First Floor Rooftop Lounge', tableNumber: 'T-11', capacity: 2, status: 'RUNNING', runningAmount: 920.0, seatedAt: new Date(Date.now() - 18 * 60000), currentOrderId: 'ord-106', guestName: 'Aman & Neha', posX: 50, posY: 50 },
  { id: 'tbl-12', sectionId: 'sec-02', sectionName: 'First Floor Rooftop Lounge', tableNumber: 'T-12', capacity: 2, status: 'VACANT', runningAmount: 0, seatedAt: null, currentOrderId: null, posX: 170, posY: 50 },
  { id: 'tbl-13', sectionId: 'sec-02', sectionName: 'First Floor Rooftop Lounge', tableNumber: 'T-13', capacity: 4, status: 'RUNNING', runningAmount: 1650.0, seatedAt: new Date(Date.now() - 32 * 60000), currentOrderId: 'ord-107', guestName: 'Dr. Vivek', posX: 290, posY: 50 },
  { id: 'tbl-14', sectionId: 'sec-02', sectionName: 'First Floor Rooftop Lounge', tableNumber: 'T-14', capacity: 4, status: 'RESERVED', runningAmount: 0, seatedAt: null, reservationTime: '9:00 PM', guestName: 'Deepak Parekh', posX: 50, posY: 180 },
  { id: 'tbl-15', sectionId: 'sec-02', sectionName: 'First Floor Rooftop Lounge', tableNumber: 'T-15', capacity: 6, status: 'RUNNING', runningAmount: 3120.0, seatedAt: new Date(Date.now() - 70 * 60000), currentOrderId: 'ord-108', guestName: 'Infosys Team', posX: 170, posY: 180 },
  { id: 'tbl-16', sectionId: 'sec-02', sectionName: 'First Floor Rooftop Lounge', tableNumber: 'T-16', capacity: 6, status: 'BILLED', runningAmount: 2840.0, seatedAt: new Date(Date.now() - 80 * 60000), currentOrderId: 'ord-109', guestName: 'Gaurav Gill', posX: 290, posY: 180 },

  // Garden Patio (T-17 to T-20)
  { id: 'tbl-17', sectionId: 'sec-03', sectionName: 'Outdoor Garden Patio', tableNumber: 'T-17', capacity: 4, status: 'RUNNING', runningAmount: 1100.0, seatedAt: new Date(Date.now() - 20 * 60000), currentOrderId: 'ord-110', guestName: 'Tanvi Shah', posX: 50, posY: 50 },
  { id: 'tbl-18', sectionId: 'sec-03', sectionName: 'Outdoor Garden Patio', tableNumber: 'T-18', capacity: 4, status: 'VACANT', runningAmount: 0, seatedAt: null, currentOrderId: null, posX: 200, posY: 50 },
  { id: 'tbl-19', sectionId: 'sec-03', sectionName: 'Outdoor Garden Patio', tableNumber: 'T-19', capacity: 4, status: 'RUNNING', runningAmount: 850.0, seatedAt: new Date(Date.now() - 10 * 60000), currentOrderId: 'ord-111', guestName: 'Rohan Mehra', posX: 50, posY: 180 },
  { id: 'tbl-20', sectionId: 'sec-03', sectionName: 'Outdoor Garden Patio', tableNumber: 'T-20', capacity: 4, status: 'VACANT', runningAmount: 0, seatedAt: null, currentOrderId: null, posX: 200, posY: 180 },
];

export let MOCK_RESERVATIONS: any[] = [
  { id: 'res-01', customerName: 'Anand Mahindra', customerPhone: '9822100001', guestCount: 4, tableNumber: 'T-08', reservedAt: new Date(Date.now() + 60 * 60000), status: 'CONFIRMED', notes: 'VIP Table required, window facing' },
  { id: 'res-02', customerName: 'Deepak Parekh', customerPhone: '9845011112', guestCount: 4, tableNumber: 'T-14', reservedAt: new Date(Date.now() + 120 * 60000), status: 'CONFIRMED', notes: 'Anniversary celebration with cake' },
  { id: 'res-03', customerName: 'Shalini Nambiar', customerPhone: '9830022223', guestCount: 6, tableNumber: 'T-05', reservedAt: new Date(Date.now() - 30 * 60000), status: 'SEATED', notes: 'Walked in on time' },
];

export let MOCK_KOTS: any[] = [
  {
    id: 'kot-201',
    kotNumber: 'KOT-201',
    orderNumber: 'ORD-20261028-101',
    tableNumber: 'T-04',
    orderType: 'DINE_IN',
    station: 'VEG',
    status: 'PREPARING',
    createdAt: new Date(Date.now() - 14 * 60000), // 14 mins ago
    waiter: 'Karthik Gowda',
    items: [
      { id: 'ki-1', name: 'Paneer Butter Masala', quantity: 2, notes: 'Medium spicy, extra butter', status: 'COOKING' },
      { id: 'ki-2', name: 'Garlic Butter Naan', quantity: 4, notes: 'Well toasted', status: 'COOKING' },
    ],
  },
  {
    id: 'kot-202',
    kotNumber: 'KOT-202',
    orderNumber: 'ORD-20261028-102',
    tableNumber: 'T-09',
    orderType: 'DINE_IN',
    station: 'NON_VEG',
    status: 'READY',
    createdAt: new Date(Date.now() - 22 * 60000), // 22 mins ago (delayed)
    waiter: 'Karthik Gowda',
    items: [
      { id: 'ki-3', name: 'Butter Chicken Old Delhi Style', quantity: 2, notes: 'Boneless preferred', status: 'READY' },
      { id: 'ki-4', name: 'Hyderabadi Chicken Dum Biryani', quantity: 2, notes: 'With extra salan & raita', status: 'READY' },
    ],
  },
  {
    id: 'kot-203',
    kotNumber: 'KOT-203',
    orderNumber: 'ORD-20261028-103',
    tableNumber: 'T-01',
    orderType: 'DINE_IN',
    station: 'TANDOOR',
    status: 'NEW',
    createdAt: new Date(Date.now() - 4 * 60000), // 4 mins ago (urgent new)
    waiter: 'Rahul Nair',
    items: [
      { id: 'ki-5', name: 'Paneer Tikka Angara', quantity: 1, notes: 'Crispy edges', status: 'ORDERED' },
      { id: 'ki-6', name: 'Tandoori Roti (Plain)', quantity: 3, notes: 'Soft', status: 'ORDERED' },
    ],
  },
  {
    id: 'kot-204',
    kotNumber: 'KOT-204',
    orderNumber: 'ORD-20261028-106',
    tableNumber: 'T-11',
    orderType: 'DINE_IN',
    station: 'BAR',
    status: 'NEW',
    createdAt: new Date(Date.now() - 6 * 60000), // 6 mins ago
    waiter: 'Karthik Gowda',
    items: [
      { id: 'ki-7', name: 'Special Mango Lassi', quantity: 2, notes: 'Chilled with ice', status: 'ORDERED' },
      { id: 'ki-8', name: 'Virgin Mojito', quantity: 1, notes: 'Less sweet', status: 'ORDERED' },
    ],
  },
];

// ==========================================
// PHASE 4: CRM, CUSTOMERS, SEGMENTS, LOYALTY, WALLET & COUPONS
// ==========================================

export interface MockCustomer {
  id: string;
  brandId: string;
  name: string;
  phone: string;
  email: string | null;
  birthday: string | null; // YYYY-MM-DD
  anniversary: string | null; // YYYY-MM-DD
  tierId: string;
  tierName: string;
  walletBalance: number;
  totalPoints: number;
  totalSpend: number;
  visitCount: number;
  lastVisit: string; // ISO date
  isBlocked: boolean;
  notes?: string;
  tags: string[];
  address: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
  };
  favoriteItems: string[];
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    date: string;
    billAmount: number;
    status: string;
    paymentMode: string;
    itemsSummary: string;
  }>;
  loyaltyLedger: Array<{
    id: string;
    date: string;
    type: 'EARN' | 'REDEEM' | 'ADJUST' | 'EXPIRE';
    points: number;
    balanceAfter: number;
    reason: string;
  }>;
  walletLedger: Array<{
    id: string;
    date: string;
    type: 'TOPUP' | 'DEBIT_BILL' | 'CASHBACK' | 'REFUND' | 'ADJUSTMENT';
    amount: number;
    balanceAfter: number;
    referenceNote: string;
  }>;
}

export let MOCK_LOYALTY_PROGRAM = {
  id: 'lp-001',
  brandId: 'brand-restodesk-001',
  name: 'RestoDesk Delights Loyalty',
  isActive: true,
  earnRulePointsPerRupee: 0.05, // 1 point per ₹20 spent (5% cashback value)
  minBillToEarn: 150.0,
  redeemPointValueInRupees: 1.0, // 1 point = ₹1.00
  minPointsToRedeem: 50,
  maxRedeemPercentOfBill: 50.0, // Max 50% of bill amount can be settled via points
  pointsExpiryDays: 365,
  autoCashbackPercent: 2.5,
  welcomeBonusWallet: 100.0,
  birthdayBonusWallet: 250.0,
  referralBonusWallet: 150.0,
};

export let MOCK_LOYALTY_TIERS = [
  {
    id: 'tier-silver',
    name: 'Silver Member',
    minSpend: 0,
    multiplier: 1.0,
    perksDescription: '1x points earn rate, complimentary welcome drink, digital receipt receipts on WhatsApp',
    color: '#94a3b8',
    customerCount: 8,
  },
  {
    id: 'tier-gold',
    name: 'Gold Member',
    minSpend: 5000,
    multiplier: 1.25,
    perksDescription: '1.25x points earn rate, ₹250 birthday voucher, free chef special dessert, 5% cashback on wallet top-up',
    color: '#f59e0b',
    customerCount: 6,
  },
  {
    id: 'tier-platinum',
    name: 'Platinum VIP',
    minSpend: 15000,
    multiplier: 1.5,
    perksDescription: '1.5x points earn rate, priority table reservation, 10% wallet cashback, free valet parking, chef customized greetings',
    color: '#8b5cf6',
    customerCount: 4,
  },
];

export let MOCK_CUSTOMERS: MockCustomer[] = [
  {
    id: 'cust-101',
    brandId: 'brand-restodesk-001',
    name: 'Amitabh Sengupta',
    phone: '9830054321',
    email: 'amitabh.sengupta@example.com',
    birthday: '1984-11-12',
    anniversary: '2012-02-14',
    tierId: 'tier-platinum',
    tierName: 'Platinum VIP',
    walletBalance: 2450.0,
    totalPoints: 1540,
    totalSpend: 34500.0,
    visitCount: 45,
    lastVisit: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
    isBlocked: false,
    notes: 'Prefers Table T-01 window seat. Loves extra spicy boneless Mutton Rogan Josh with Garlic Naan.',
    tags: ['VIP', 'High Spender', 'Wine Lover', 'Family'],
    address: {
      addressLine1: 'B-402, Imperial Heights, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
    },
    favoriteItems: ['Mutton Rogan Josh Kashmiri', 'Garlic Butter Naan', 'Bhatti Da Murgh', 'Special Mango Lassi'],
    recentOrders: [
      { id: 'ord-101', orderNumber: 'ORD-20261026-089', date: '26/10/2026', billAmount: 2450.0, status: 'COMPLETED', paymentMode: 'UPI_QR', itemsSummary: 'Mutton Rogan Josh x2, Garlic Naan x4, Dal Makhani x1' },
      { id: 'ord-102', orderNumber: 'ORD-20261018-042', date: '18/10/2026', billAmount: 3120.0, status: 'COMPLETED', paymentMode: 'WALLET', itemsSummary: 'Murgh Malai Tikka x2, Dum Biryani x2, Mocktails x3' },
      { id: 'ord-103', orderNumber: 'ORD-20261005-015', date: '05/10/2026', billAmount: 1890.0, status: 'COMPLETED', paymentMode: 'CARD', itemsSummary: 'Amritsari Fish Fry x2, Tandoori Roti x5' },
    ],
    loyaltyLedger: [
      { id: 'lt-1', date: '26/10/2026', type: 'EARN', points: 183, balanceAfter: 1540, reason: 'Bill ORD-20261026-089 (1.5x Platinum tier)' },
      { id: 'lt-2', date: '18/10/2026', type: 'REDEEM', points: -200, balanceAfter: 1357, reason: 'Redeemed ₹200 on Bill ORD-20261018-042' },
      { id: 'lt-3', date: '18/10/2026', type: 'EARN', points: 219, balanceAfter: 1557, reason: 'Bill ORD-20261018-042' },
      { id: 'lt-4', date: '01/10/2026', type: 'ADJUST', points: 100, balanceAfter: 1338, reason: 'Customer Delight Diwali Bonus Points' },
    ],
    walletLedger: [
      { id: 'wt-1', date: '18/10/2026', type: 'DEBIT_BILL', amount: -1500.0, balanceAfter: 2450.0, referenceNote: 'Settlement for ORD-20261018-042' },
      { id: 'wt-2', date: '10/10/2026', type: 'TOPUP', amount: 3000.0, balanceAfter: 3950.0, referenceNote: 'Festive wallet recharge (Got ₹300 bonus)' },
      { id: 'wt-3', date: '10/10/2026', type: 'CASHBACK', amount: 300.0, balanceAfter: 950.0, referenceNote: '10% Platinum wallet topup bonus' },
    ],
  },
  {
    id: 'cust-102',
    brandId: 'brand-restodesk-001',
    name: 'Priya Sundaram',
    phone: '9845098765',
    email: 'priya.sundaram@techcorp.in',
    birthday: '1991-10-30', // Birthday this month!
    anniversary: '2019-12-08',
    tierId: 'tier-platinum',
    tierName: 'Platinum VIP',
    walletBalance: 1100.0,
    totalPoints: 920,
    totalSpend: 21800.0,
    visitCount: 28,
    lastVisit: new Date(Date.now() - 3 * 86400000).toISOString(),
    isBlocked: false,
    notes: 'Vegetarian connoisseur. Celebrates team wins here. Prefers mild spices and jaggery sweetened desserts.',
    tags: ['VIP', 'Pure Veg', 'Corporate', 'Regular'],
    address: {
      addressLine1: 'Villa 14, Palm Meadows, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
    },
    favoriteItems: ['Paneer Tikka Angara', 'Dal Makhani Special', 'Gulab Jamun with Rabri', 'Fresh Lime Soda'],
    recentOrders: [
      { id: 'ord-104', orderNumber: 'ORD-20261025-071', date: '25/10/2026', billAmount: 1850.0, status: 'COMPLETED', paymentMode: 'UPI_QR', itemsSummary: 'Paneer Butter Masala x2, Dal Makhani x1, Naan x4' },
      { id: 'ord-105', orderNumber: 'ORD-20261012-033', date: '12/10/2026', billAmount: 2600.0, status: 'COMPLETED', paymentMode: 'CARD', itemsSummary: 'Dahi Ke Kebab x2, Paneer Biryani x3, Lassi x3' },
    ],
    loyaltyLedger: [
      { id: 'lt-5', date: '25/10/2026', type: 'EARN', points: 138, balanceAfter: 920, reason: 'Bill ORD-20261025-071 (1.5x VIP earn)' },
      { id: 'lt-6', date: '12/10/2026', type: 'EARN', points: 195, balanceAfter: 782, reason: 'Bill ORD-20261012-033' },
    ],
    walletLedger: [
      { id: 'wt-4', date: '15/10/2026', type: 'TOPUP', amount: 1000.0, balanceAfter: 1100.0, referenceNote: 'UPI Wallet Topup' },
    ],
  },
  {
    id: 'cust-103',
    brandId: 'brand-restodesk-001',
    name: 'Rajesh Mehta',
    phone: '9820123456',
    email: 'rajesh.mehta@mumbaiholding.com',
    birthday: '1988-04-15',
    anniversary: '2016-10-29', // Anniversary this month!
    tierId: 'tier-gold',
    tierName: 'Gold Member',
    walletBalance: 450.0,
    totalPoints: 480,
    totalSpend: 11200.0,
    visitCount: 16,
    lastVisit: new Date(Date.now() - 5 * 86400000).toISOString(),
    isBlocked: false,
    notes: 'Regular business diner. Always asks for GST tax invoice copy on WhatsApp.',
    tags: ['Gold Member', 'Corporate', 'Regular'],
    address: {
      addressLine1: 'Flat 1204, Lodha Bellissimo, Worli',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400018',
    },
    favoriteItems: ['Butter Chicken Old Delhi Style', 'Tandoori Roti', 'Paneer Chilli Dry'],
    recentOrders: [
      { id: 'ord-106', orderNumber: 'ORD-20261023-019', date: '23/10/2026', billAmount: 1420.0, status: 'COMPLETED', paymentMode: 'CASH', itemsSummary: 'Butter Chicken x1, Garlic Naan x3, Jeera Rice x1' },
    ],
    loyaltyLedger: [
      { id: 'lt-7', date: '23/10/2026', type: 'EARN', points: 88, balanceAfter: 480, reason: 'Bill ORD-20261023-019 (1.25x Gold earn)' },
    ],
    walletLedger: [
      { id: 'wt-5', date: '20/10/2026', type: 'CASHBACK', amount: 50.0, balanceAfter: 450.0, referenceNote: 'Weekend Dining Cashback' },
    ],
  },
  {
    id: 'cust-104',
    brandId: 'brand-restodesk-001',
    name: 'Sneha Kulkarni',
    phone: '9822011223',
    email: 'sneha.kulkarni@gmail.com',
    birthday: '1995-07-22',
    anniversary: null,
    tierId: 'tier-gold',
    tierName: 'Gold Member',
    walletBalance: 320.0,
    totalPoints: 360,
    totalSpend: 8400.0,
    visitCount: 11,
    lastVisit: new Date(Date.now() - 9 * 86400000).toISOString(),
    isBlocked: false,
    notes: 'Loves spicy Chinese appetizers and mocktails.',
    tags: ['Gold Member', 'Youth', 'Foodie'],
    address: {
      addressLine1: '301, Greenwood Park, Kothrud',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411038',
    },
    favoriteItems: ['Chilli Chicken Dry Hakka', 'Veg Hakka Noodles', 'Virgin Mojito'],
    recentOrders: [
      { id: 'ord-107', orderNumber: 'ORD-20261019-067', date: '19/10/2026', billAmount: 1250.0, status: 'COMPLETED', paymentMode: 'UPI_QR', itemsSummary: 'Chilli Chicken x1, Noodles x2, Mojito x2' },
    ],
    loyaltyLedger: [
      { id: 'lt-8', date: '19/10/2026', type: 'EARN', points: 78, balanceAfter: 360, reason: 'Bill ORD-20261019-067' },
    ],
    walletLedger: [],
  },
  {
    id: 'cust-105',
    brandId: 'brand-restodesk-001',
    name: 'Vikramaditya Roy',
    phone: '9831144556',
    email: 'v.roy@calcutta-art.org',
    birthday: '1979-09-18',
    anniversary: '2008-11-20',
    tierId: 'tier-gold',
    tierName: 'Gold Member',
    walletBalance: 600.0,
    totalPoints: 510,
    totalSpend: 9600.0,
    visitCount: 13,
    lastVisit: new Date(Date.now() - 14 * 86400000).toISOString(),
    isBlocked: false,
    notes: 'Family visits on Sundays. Appreciates quiet corner booth.',
    tags: ['Family', 'Gold Member'],
    address: {
      addressLine1: '7A, Southern Avenue, Lake Gardens',
      city: 'Kolkata',
      state: 'West Bengal',
      postalCode: '700029',
    },
    favoriteItems: ['Amritsari Fish Fry', 'Hyderabadi Chicken Dum Biryani'],
    recentOrders: [
      { id: 'ord-108', orderNumber: 'ORD-20261014-045', date: '14/10/2026', billAmount: 1980.0, status: 'COMPLETED', paymentMode: 'CARD', itemsSummary: 'Amritsari Fish x2, Chicken Biryani x2' },
    ],
    loyaltyLedger: [],
    walletLedger: [],
  },
  {
    id: 'cust-106',
    brandId: 'brand-restodesk-001',
    name: 'Rohan Verma',
    phone: '9811223344',
    email: 'rohan.v@delhi-ventures.in',
    birthday: '1992-10-14', // Birthday this month!
    anniversary: null,
    tierId: 'tier-gold',
    tierName: 'Gold Member',
    walletBalance: 150.0,
    totalPoints: 290,
    totalSpend: 7800.0,
    visitCount: 9,
    lastVisit: new Date(Date.now() - 8 * 86400000).toISOString(),
    isBlocked: false,
    notes: 'Regular late-evening diner with colleagues.',
    tags: ['Gold Member', 'Corporate', 'Foodie'],
    address: {
      addressLine1: 'C-12, Hauz Khas Enclave',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110016',
    },
    favoriteItems: ['Bhatti Da Murgh', 'Tandoori Roti', 'Dal Makhani Special'],
    recentOrders: [],
    loyaltyLedger: [],
    walletLedger: [],
  },
  {
    id: 'cust-107',
    brandId: 'brand-restodesk-001',
    name: 'Ananya Sharma',
    phone: '9876543210',
    email: 'ananya.sharma@startup.co',
    birthday: '1998-03-25',
    anniversary: null,
    tierId: 'tier-silver',
    tierName: 'Silver Member',
    walletBalance: 100.0,
    totalPoints: 85,
    totalSpend: 1650.0,
    visitCount: 2,
    lastVisit: new Date(Date.now() - 6 * 86400000).toISOString(),
    isBlocked: false,
    notes: 'First visited through Swiggy, now loves coming in-person for mocktails.',
    tags: ['New Guest', 'Silver Member'],
    address: {
      addressLine1: 'B-201, Sunrise Apartments, HSR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560102',
    },
    favoriteItems: ['Virgin Mojito', 'Crispy Corn Salt & Pepper'],
    recentOrders: [],
    loyaltyLedger: [],
    walletLedger: [],
  },
  {
    id: 'cust-108',
    brandId: 'brand-restodesk-001',
    name: 'Gaurav Gill',
    phone: '9818899001',
    email: 'gaurav.gill@speedmail.com',
    birthday: '1987-08-05',
    anniversary: '2015-05-10',
    tierId: 'tier-silver',
    tierName: 'Silver Member',
    walletBalance: 0.0,
    totalPoints: 45,
    totalSpend: 920.0,
    visitCount: 1,
    lastVisit: new Date(Date.now() - 4 * 86400000).toISOString(),
    isBlocked: false,
    notes: 'New walk-in guest at bar section.',
    tags: ['New Guest'],
    address: {
      addressLine1: 'Sector 54, Golf Course Road',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122002',
    },
    favoriteItems: ['Paneer Tikka Angara'],
    recentOrders: [],
    loyaltyLedger: [],
    walletLedger: [],
  },
  {
    id: 'cust-109',
    brandId: 'brand-restodesk-001',
    name: 'Kavita Patel',
    phone: '9879123456',
    email: 'kavita.patel@gujarattextile.com',
    birthday: '1985-02-18',
    anniversary: '2010-12-22',
    tierId: 'tier-silver',
    tierName: 'Silver Member',
    walletBalance: 200.0,
    totalPoints: 210,
    totalSpend: 4600.0,
    visitCount: 5,
    lastVisit: new Date(Date.now() - 38 * 86400000).toISOString(), // 38 days ago -> At-Risk!
    isBlocked: false,
    notes: 'Used to visit every alternate Friday with family. Has not visited in over a month.',
    tags: ['At-Risk', 'Family'],
    address: {
      addressLine1: 'Bodakdev, SG Highway',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '380054',
    },
    favoriteItems: ['Paneer Butter Masala', 'Dahi Ke Kebab'],
    recentOrders: [],
    loyaltyLedger: [],
    walletLedger: [],
  },
  {
    id: 'cust-110',
    brandId: 'brand-restodesk-001',
    name: 'Tanvi Deshmukh',
    phone: '9823456789',
    email: 'tanvi.deshmukh@symbiosis.edu',
    birthday: '1996-10-08', // Birthday this month!
    anniversary: null,
    tierId: 'tier-silver',
    tierName: 'Silver Member',
    walletBalance: 50.0,
    totalPoints: 175,
    totalSpend: 3900.0,
    visitCount: 4,
    lastVisit: new Date(Date.now() - 44 * 86400000).toISOString(), // 44 days ago -> At-Risk!
    isBlocked: false,
    notes: 'Student group regular. Sends coupons to win back.',
    tags: ['At-Risk', 'Youth'],
    address: {
      addressLine1: 'FC Road, Shivaji Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411005',
    },
    favoriteItems: ['Chilli Paneer Gravy', 'Veg Fried Rice'],
    recentOrders: [],
    loyaltyLedger: [],
    walletLedger: [],
  },
  {
    id: 'cust-111',
    brandId: 'brand-restodesk-001',
    name: 'Suresh Nair',
    phone: '9847012345',
    email: 'suresh.nair@cochinlogistics.com',
    birthday: '1975-06-30',
    anniversary: '2001-09-12',
    tierId: 'tier-gold',
    tierName: 'Gold Member',
    walletBalance: 350.0,
    totalPoints: 340,
    totalSpend: 7200.0,
    visitCount: 9,
    lastVisit: new Date(Date.now() - 78 * 86400000).toISOString(), // 78 days ago -> Lapsed (60-90d)!
    isBlocked: false,
    notes: 'High value regular who stopped visiting. Ideal candidate for 20% win-back campaign.',
    tags: ['Lapsed', 'High Value Churn Risk'],
    address: {
      addressLine1: 'Panampilly Nagar',
      city: 'Kochi',
      state: 'Kerala',
      postalCode: '682036',
    },
    favoriteItems: ['Mutton Rogan Josh Kashmiri', 'Tandoori Roti'],
    recentOrders: [],
    loyaltyLedger: [],
    walletLedger: [],
  },
  {
    id: 'cust-112',
    brandId: 'brand-restodesk-001',
    name: 'Deepa Iyer',
    phone: '9840198765',
    email: 'deepa.iyer@chennaiclassical.org',
    birthday: '1982-12-04',
    anniversary: '2009-01-26',
    tierId: 'tier-silver',
    tierName: 'Silver Member',
    walletBalance: 0.0,
    totalPoints: 120,
    totalSpend: 2800.0,
    visitCount: 3,
    lastVisit: new Date(Date.now() - 105 * 86400000).toISOString(), // 105 days ago -> Lapsed (90d+)!
    isBlocked: false,
    notes: 'No visits in 3+ months.',
    tags: ['Lapsed'],
    address: {
      addressLine1: 'Mylapore',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600004',
    },
    favoriteItems: ['Dal Makhani Special'],
    recentOrders: [],
    loyaltyLedger: [],
    walletLedger: [],
  },
  {
    id: 'cust-113',
    brandId: 'brand-restodesk-001',
    name: 'Manish Bhatia',
    phone: '9810156789',
    email: 'manish.bhatia@chandigarhsteel.com',
    birthday: '1973-10-21', // Birthday this month!
    anniversary: '1998-11-25',
    tierId: 'tier-platinum',
    tierName: 'Platinum VIP',
    walletBalance: 3200.0,
    totalPoints: 1890,
    totalSpend: 42000.0,
    visitCount: 52,
    lastVisit: new Date(Date.now() - 1 * 86400000).toISOString(), // Yesterday
    isBlocked: false,
    notes: 'Top tier patron. Loves celebrating family birthdays here with customized multi-course menus.',
    tags: ['VIP', 'Top Spender', 'Family'],
    address: {
      addressLine1: 'Sector 9-D',
      city: 'Chandigarh',
      state: 'Punjab',
      postalCode: '160009',
    },
    favoriteItems: ['Butter Chicken Old Delhi Style', 'Mutton Seekh Kebab', 'Gulab Jamun with Rabri'],
    recentOrders: [],
    loyaltyLedger: [],
    walletLedger: [],
  },
  {
    id: 'cust-114',
    brandId: 'brand-restodesk-001',
    name: 'Ritu Chawla',
    phone: '9811998877',
    email: 'ritu.chawla@delhicaterers.in',
    birthday: '1989-05-14',
    anniversary: '2014-10-18', // Anniversary this month!
    tierId: 'tier-silver',
    tierName: 'Silver Member',
    walletBalance: 0.0,
    totalPoints: 60,
    totalSpend: 1400.0,
    visitCount: 2,
    lastVisit: new Date(Date.now() - 18 * 86400000).toISOString(),
    isBlocked: true, // Blocked due to payment dispute / chargeback
    notes: 'Customer account suspended due to repeated unpaid delivery cancellations. Verification pending.',
    tags: ['Blocked', 'Dispute'],
    address: {
      addressLine1: 'Block C, Vasant Vihar',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110057',
    },
    favoriteItems: ['Paneer Tikka Angara'],
    recentOrders: [],
    loyaltyLedger: [],
    walletLedger: [],
  },
];

export interface MockSegment {
  id: string;
  brandId: string;
  name: string;
  description: string;
  isSystem: boolean;
  customerCount: number;
  rules: Array<{
    field: string;
    operator: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN';
    value: string;
    logicalOperator?: 'AND' | 'OR';
  }>;
}

export let MOCK_SEGMENTS: MockSegment[] = [
  {
    id: 'seg-01',
    brandId: 'brand-restodesk-001',
    name: 'New Guests (First Time)',
    description: 'Customers with 1 visit who joined recently. High potential for 2nd visit conversion.',
    isSystem: true,
    customerCount: 2,
    rules: [{ field: 'visits', operator: 'LESS_THAN', value: '2' }],
  },
  {
    id: 'seg-02',
    brandId: 'brand-restodesk-001',
    name: 'Regular Guests',
    description: 'Active diners with 3 to 15 visits and consistent footfall.',
    isSystem: true,
    customerCount: 5,
    rules: [
      { field: 'visits', operator: 'GREATER_THAN', value: '2' },
      { field: 'visits', operator: 'LESS_THAN', value: '16', logicalOperator: 'AND' },
    ],
  },
  {
    id: 'seg-03',
    brandId: 'brand-restodesk-001',
    name: 'VIP High Spenders',
    description: 'Top spenders with lifetime billings above ₹15,000 or Platinum VIP status.',
    isSystem: true,
    customerCount: 3,
    rules: [{ field: 'spend', operator: 'GREATER_THAN', value: '15000' }],
  },
  {
    id: 'seg-04',
    brandId: 'brand-restodesk-001',
    name: 'At-Risk Guests (30-60 Days)',
    description: 'Past regular patrons who have not visited in the last 30 to 60 days.',
    isSystem: true,
    customerCount: 2,
    rules: [
      { field: 'daysSinceLastVisit', operator: 'GREATER_THAN', value: '30' },
      { field: 'daysSinceLastVisit', operator: 'LESS_THAN', value: '61', logicalOperator: 'AND' },
    ],
  },
  {
    id: 'seg-05',
    brandId: 'brand-restodesk-001',
    name: 'Lapsed Guests (60+ Days)',
    description: 'Dormant customers inactive for 60+ days requiring win-back discounts.',
    isSystem: true,
    customerCount: 2,
    rules: [{ field: 'daysSinceLastVisit', operator: 'GREATER_THAN', value: '60' }],
  },
  {
    id: 'seg-06',
    brandId: 'brand-restodesk-001',
    name: 'Celebrations This Month',
    description: 'Patrons with birthday or wedding anniversary in the current calendar month.',
    isSystem: true,
    customerCount: 5,
    rules: [{ field: 'birthdayMonth', operator: 'EQUALS', value: 'CURRENT_MONTH' }],
  },
];

export interface MockCoupon {
  id: string;
  brandId: string;
  code: string;
  title: string;
  description: string;
  couponType: 'FLAT_DISCOUNT' | 'PERCENTAGE' | 'FREE_ITEM' | 'BOGO' | 'COMBO';
  discountValue: number;
  maxDiscount?: number;
  minBillAmount: number;
  validFrom: string;
  validTo: string;
  usageLimitTotal?: number;
  usageLimitPerCustomer: number;
  timesUsed: number;
  revenueInfluenced: number;
  isStackable: boolean;
  isActive: boolean;
}

export let MOCK_COUPONS: MockCoupon[] = [
  {
    id: 'cpn-01',
    brandId: 'brand-restodesk-001',
    code: 'WELCOME100',
    title: 'First Visit ₹100 Off',
    description: 'Flat ₹100 discount for new diners on their first meal',
    couponType: 'FLAT_DISCOUNT',
    discountValue: 100,
    minBillAmount: 500,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    usageLimitTotal: 1000,
    usageLimitPerCustomer: 1,
    timesUsed: 214,
    revenueInfluenced: 172400,
    isStackable: false,
    isActive: true,
  },
  {
    id: 'cpn-02',
    brandId: 'brand-restodesk-001',
    code: 'FEAST20',
    title: '20% Dine-In Feast',
    description: '20% off on all main courses and starters up to ₹300',
    couponType: 'PERCENTAGE',
    discountValue: 20,
    maxDiscount: 300,
    minBillAmount: 800,
    validFrom: '2026-10-01',
    validTo: '2026-11-30',
    usageLimitTotal: 500,
    usageLimitPerCustomer: 3,
    timesUsed: 382,
    revenueInfluenced: 458400,
    isStackable: false,
    isActive: true,
  },
  {
    id: 'cpn-03',
    brandId: 'brand-restodesk-001',
    code: 'BOGOBIRYANI',
    title: 'Buy 1 Get 1 Dum Biryani',
    description: 'Buy one Hyderabadi Biryani and get the second free on weekdays',
    couponType: 'BOGO',
    discountValue: 380,
    minBillAmount: 600,
    validFrom: '2026-10-15',
    validTo: '2026-12-15',
    usageLimitTotal: 250,
    usageLimitPerCustomer: 2,
    timesUsed: 126,
    revenueInfluenced: 138600,
    isStackable: false,
    isActive: true,
  },
  {
    id: 'cpn-04',
    brandId: 'brand-restodesk-001',
    code: 'VIP500',
    title: 'Platinum VIP Special ₹500',
    description: 'Flat ₹500 discount for premium celebrations above ₹2,500',
    couponType: 'FLAT_DISCOUNT',
    discountValue: 500,
    minBillAmount: 2500,
    validFrom: '2026-09-01',
    validTo: '2026-12-31',
    usageLimitTotal: 200,
    usageLimitPerCustomer: 5,
    timesUsed: 89,
    revenueInfluenced: 293700,
    isStackable: true,
    isActive: true,
  },
  {
    id: 'cpn-05',
    brandId: 'brand-restodesk-001',
    code: 'SWEETTOOTH',
    title: 'Complimentary Dessert',
    description: 'Get free Gulab Jamun with Rabri on orders exceeding ₹750',
    couponType: 'FREE_ITEM',
    discountValue: 180,
    minBillAmount: 750,
    validFrom: '2026-10-01',
    validTo: '2026-11-15',
    usageLimitTotal: 300,
    usageLimitPerCustomer: 1,
    timesUsed: 154,
    revenueInfluenced: 146300,
    isStackable: false,
    isActive: true,
  },
  {
    id: 'cpn-06',
    brandId: 'brand-restodesk-001',
    code: 'FESTIVE15',
    title: 'Diwali Festive Combo 15%',
    description: '15% savings across all family combo orders',
    couponType: 'PERCENTAGE',
    discountValue: 15,
    maxDiscount: 450,
    minBillAmount: 1200,
    validFrom: '2026-10-20',
    validTo: '2026-11-10',
    usageLimitTotal: 500,
    usageLimitPerCustomer: 2,
    timesUsed: 98,
    revenueInfluenced: 147000,
    isStackable: false,
    isActive: true,
  },
];

export function evaluateSegmentMatch(customer: MockCustomer, rules: MockSegment['rules']): boolean {
  if (!rules || rules.length === 0) return true;

  const currentMonth = new Date().getMonth() + 1;
  const now = Date.now();
  const lastVisitDiffDays = (now - new Date(customer.lastVisit).getTime()) / 86400000;

  let overallMatch = true;

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    let ruleMatch = false;

    if (rule.field === 'spend') {
      const numVal = parseFloat(rule.value);
      if (rule.operator === 'GREATER_THAN') ruleMatch = customer.totalSpend >= numVal;
      else if (rule.operator === 'LESS_THAN') ruleMatch = customer.totalSpend <= numVal;
      else if (rule.operator === 'EQUALS') ruleMatch = Math.abs(customer.totalSpend - numVal) < 1;
    } else if (rule.field === 'visits') {
      const numVal = parseInt(rule.value, 10);
      if (rule.operator === 'GREATER_THAN') ruleMatch = customer.visitCount >= numVal;
      else if (rule.operator === 'LESS_THAN') ruleMatch = customer.visitCount <= numVal;
      else if (rule.operator === 'EQUALS') ruleMatch = customer.visitCount === numVal;
    } else if (rule.field === 'daysSinceLastVisit') {
      const numVal = parseFloat(rule.value);
      if (rule.operator === 'GREATER_THAN') ruleMatch = lastVisitDiffDays >= numVal;
      else if (rule.operator === 'LESS_THAN') ruleMatch = lastVisitDiffDays <= numVal;
    } else if (rule.field === 'tier') {
      ruleMatch =
        customer.tierName.toLowerCase().includes(rule.value.toLowerCase()) ||
        customer.tierId.toLowerCase() === rule.value.toLowerCase();
    } else if (rule.field === 'birthdayMonth') {
      if (customer.birthday) {
        const bMonth = parseInt(customer.birthday.split('-')[1], 10);
        if (rule.value === 'CURRENT_MONTH') ruleMatch = bMonth === currentMonth;
        else ruleMatch = bMonth === parseInt(rule.value, 10);
      }
    } else if (rule.field === 'tag') {
      ruleMatch = customer.tags.some((t) => t.toLowerCase() === rule.value.toLowerCase());
    }

    if (i === 0) {
      overallMatch = ruleMatch;
    } else {
      if (rule.logicalOperator === 'OR') {
        overallMatch = overallMatch || ruleMatch;
      } else {
        overallMatch = overallMatch && ruleMatch;
      }
    }
  }

  return overallMatch;
}

// ==========================================
// PHASE 5: INVENTORY, RECIPES, PURCHASE & SUPPLIERS
// ==========================================

export interface MockRawMaterial {
  id: string;
  brandId: string;
  name: string;
  sku: string;
  category: 'Dairy' | 'Poultry & Meat' | 'Produce & Veg' | 'Spices & Seasonings' | 'Grains & Staples' | 'Beverages & Syrups' | 'Packaging';
  unit: 'KG' | 'GRAM' | 'LITER' | 'ML' | 'PIECE' | 'PACKET';
  currentStock: number;
  minAlertStock: number;
  costPerUnit: number; // in INR per storage unit
  isDeleted: boolean;
}

export let MOCK_RAW_MATERIALS: MockRawMaterial[] = [
  // Dairy
  { id: 'rm-01', brandId: 'brand-restodesk-001', name: 'Fresh Malai Paneer', sku: 'RM-PAN-01', category: 'Dairy', unit: 'KG', currentStock: 18.5, minAlertStock: 10.0, costPerUnit: 340.0, isDeleted: false },
  { id: 'rm-02', brandId: 'brand-restodesk-001', name: 'Amul Butter (Salted)', sku: 'RM-BUT-01', category: 'Dairy', unit: 'KG', currentStock: 12.0, minAlertStock: 8.0, costPerUnit: 520.0, isDeleted: false },
  { id: 'rm-03', brandId: 'brand-restodesk-001', name: 'Amul Fresh Cooking Cream', sku: 'RM-CRM-01', category: 'Dairy', unit: 'LITER', currentStock: 6.5, minAlertStock: 10.0, costPerUnit: 220.0, isDeleted: false }, // LOW STOCK!
  { id: 'rm-04', brandId: 'brand-restodesk-001', name: 'Full Cream Milk', sku: 'RM-MLK-01', category: 'Dairy', unit: 'LITER', currentStock: 24.0, minAlertStock: 15.0, costPerUnit: 68.0, isDeleted: false },
  { id: 'rm-05', brandId: 'brand-restodesk-001', name: 'Pure Desi Cow Ghee', sku: 'RM-GHE-01', category: 'Dairy', unit: 'LITER', currentStock: 8.0, minAlertStock: 5.0, costPerUnit: 680.0, isDeleted: false },
  { id: 'rm-06', brandId: 'brand-restodesk-001', name: 'Thick Hung Curd (Dahi)', sku: 'RM-CRD-01', category: 'Dairy', unit: 'KG', currentStock: 14.0, minAlertStock: 8.0, costPerUnit: 90.0, isDeleted: false },

  // Poultry & Meat
  { id: 'rm-07', brandId: 'brand-restodesk-001', name: 'Boneless Chicken Breast Cubes', sku: 'RM-CHK-01', category: 'Poultry & Meat', unit: 'KG', currentStock: 22.0, minAlertStock: 15.0, costPerUnit: 280.0, isDeleted: false },
  { id: 'rm-08', brandId: 'brand-restodesk-001', name: 'Tandoori Whole Chicken (Curry Cut)', sku: 'RM-CHK-02', category: 'Poultry & Meat', unit: 'KG', currentStock: 16.0, minAlertStock: 12.0, costPerUnit: 220.0, isDeleted: false },
  { id: 'rm-09', brandId: 'brand-restodesk-001', name: 'Prime Tender Lamb Curry Cut', sku: 'RM-MUT-01', category: 'Poultry & Meat', unit: 'KG', currentStock: 9.5, minAlertStock: 10.0, costPerUnit: 780.0, isDeleted: false }, // LOW STOCK!
  { id: 'rm-10', brandId: 'brand-restodesk-001', name: 'Fresh Freshwater Fish Fillet (Basa)', sku: 'RM-FSH-01', category: 'Poultry & Meat', unit: 'KG', currentStock: 11.0, minAlertStock: 6.0, costPerUnit: 360.0, isDeleted: false },

  // Produce & Vegetables
  { id: 'rm-11', brandId: 'brand-restodesk-001', name: 'Nashik Red Onions', sku: 'RM-VEG-01', category: 'Produce & Veg', unit: 'KG', currentStock: 85.0, minAlertStock: 30.0, costPerUnit: 35.0, isDeleted: false },
  { id: 'rm-12', brandId: 'brand-restodesk-001', name: 'Ripe Hybrid Tomatoes', sku: 'RM-VEG-02', category: 'Produce & Veg', unit: 'KG', currentStock: 45.0, minAlertStock: 25.0, costPerUnit: 40.0, isDeleted: false },
  { id: 'rm-13', brandId: 'brand-restodesk-001', name: 'Ginger Garlic Paste (Fresh Batch)', sku: 'RM-VEG-03', category: 'Produce & Veg', unit: 'KG', currentStock: 15.0, minAlertStock: 8.0, costPerUnit: 140.0, isDeleted: false },
  { id: 'rm-14', brandId: 'brand-restodesk-001', name: 'Fresh Farm Spinach (Palak)', sku: 'RM-VEG-04', category: 'Produce & Veg', unit: 'KG', currentStock: 12.0, minAlertStock: 8.0, costPerUnit: 45.0, isDeleted: false },
  { id: 'rm-15', brandId: 'brand-restodesk-001', name: 'Green Bell Peppers (Capsicum)', sku: 'RM-VEG-05', category: 'Produce & Veg', unit: 'KG', currentStock: 18.0, minAlertStock: 10.0, costPerUnit: 60.0, isDeleted: false },
  { id: 'rm-16', brandId: 'brand-restodesk-001', name: 'Fresh Mint & Coriander Leaves', sku: 'RM-VEG-06', category: 'Produce & Veg', unit: 'KG', currentStock: 4.5, minAlertStock: 5.0, costPerUnit: 80.0, isDeleted: false }, // LOW STOCK!

  // Grains & Staples
  { id: 'rm-17', brandId: 'brand-restodesk-001', name: 'Royal Basmati Rice (Daawat Biryani)', sku: 'RM-GRN-01', category: 'Grains & Staples', unit: 'KG', currentStock: 110.0, minAlertStock: 40.0, costPerUnit: 125.0, isDeleted: false },
  { id: 'rm-18', brandId: 'brand-restodesk-001', name: 'Black Urad Dal (Makhani Special)', sku: 'RM-GRN-02', category: 'Grains & Staples', unit: 'KG', currentStock: 35.0, minAlertStock: 15.0, costPerUnit: 140.0, isDeleted: false },
  { id: 'rm-19', brandId: 'brand-restodesk-001', name: 'Refined Wheat Flour (Maida)', sku: 'RM-GRN-03', category: 'Grains & Staples', unit: 'KG', currentStock: 60.0, minAlertStock: 25.0, costPerUnit: 38.0, isDeleted: false },
  { id: 'rm-20', brandId: 'brand-restodesk-001', name: 'Refined Sunflower Cooking Oil', sku: 'RM-OIL-01', category: 'Grains & Staples', unit: 'LITER', currentStock: 48.0, minAlertStock: 20.0, costPerUnit: 135.0, isDeleted: false },

  // Spices & Seasonings
  { id: 'rm-21', brandId: 'brand-restodesk-001', name: 'Whole Cashew Nuts (Kaju W320)', sku: 'RM-NUT-01', category: 'Spices & Seasonings', unit: 'KG', currentStock: 14.0, minAlertStock: 8.0, costPerUnit: 850.0, isDeleted: false },
  { id: 'rm-22', brandId: 'brand-restodesk-001', name: 'Kashmiri Deggi Mirch Powder', sku: 'RM-SPC-01', category: 'Spices & Seasonings', unit: 'KG', currentStock: 7.5, minAlertStock: 4.0, costPerUnit: 480.0, isDeleted: false },
  { id: 'rm-23', brandId: 'brand-restodesk-001', name: 'Royal Shahi Biryani Potli Masala', sku: 'RM-SPC-02', category: 'Spices & Seasonings', unit: 'KG', currentStock: 4.0, minAlertStock: 3.0, costPerUnit: 720.0, isDeleted: false },
  { id: 'rm-24', brandId: 'brand-restodesk-001', name: 'Kasuri Methi (Nagaur Special)', sku: 'RM-SPC-03', category: 'Spices & Seasonings', unit: 'KG', currentStock: 3.0, minAlertStock: 2.0, costPerUnit: 320.0, isDeleted: false },

  // Beverages & Packaging
  { id: 'rm-25', brandId: 'brand-restodesk-001', name: 'Alphonso Mango Pulp (Tin 850g)', sku: 'RM-BEV-01', category: 'Beverages & Syrups', unit: 'PACKET', currentStock: 28.0, minAlertStock: 15.0, costPerUnit: 180.0, isDeleted: false },
  { id: 'rm-26', brandId: 'brand-restodesk-001', name: 'Food Grade Biryani Handi (Clay/Alu)', sku: 'RM-PKG-01', category: 'Packaging', unit: 'PIECE', currentStock: 120.0, minAlertStock: 50.0, costPerUnit: 24.0, isDeleted: false },
];

export interface MockRecipeIngredient {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  quantity: number;
  unit: 'KG' | 'GRAM' | 'LITER' | 'ML' | 'PIECE' | 'PACKET';
  costPerUnit: number;
  ingredientCost: number;
  wastePercentage: number;
}

export interface MockRecipe {
  id: string;
  brandId: string;
  itemId: string;
  itemName: string;
  categoryName: string;
  menuPrice: number;
  yieldQuantity: number;
  instructions: string;
  totalFoodCost: number;
  foodCostPercentage: number;
  grossMarginPercentage: number;
  ingredients: MockRecipeIngredient[];
}

export let MOCK_RECIPES: MockRecipe[] = [
  {
    id: 'rcp-01',
    brandId: 'brand-restodesk-001',
    itemId: 'itm-15',
    itemName: 'Butter Chicken Old Delhi Style',
    categoryName: 'Main Course (Curries)',
    menuPrice: 420.0,
    yieldQuantity: 1,
    instructions: 'Marinate boneless chicken cubes in tandoori yogurt spice blend. Char-grill in tandoor. Simmer in velvety tomato cashew makhani gravy with butter, cream, and kasuri methi finish.',
    totalFoodCost: 118.5,
    foodCostPercentage: 28.2, // Excellent food cost (< 30%)
    grossMarginPercentage: 71.8,
    ingredients: [
      { id: 'ri-01', rawMaterialId: 'rm-07', rawMaterialName: 'Boneless Chicken Breast Cubes', quantity: 250, unit: 'GRAM', costPerUnit: 280, ingredientCost: 70.0, wastePercentage: 5 },
      { id: 'ri-02', rawMaterialId: 'rm-02', rawMaterialName: 'Amul Butter (Salted)', quantity: 40, unit: 'GRAM', costPerUnit: 520, ingredientCost: 20.8, wastePercentage: 0 },
      { id: 'ri-03', rawMaterialId: 'rm-03', rawMaterialName: 'Amul Fresh Cooking Cream', quantity: 30, unit: 'ML', costPerUnit: 220, ingredientCost: 6.6, wastePercentage: 2 },
      { id: 'ri-04', rawMaterialId: 'rm-12', rawMaterialName: 'Ripe Hybrid Tomatoes', quantity: 150, unit: 'GRAM', costPerUnit: 40, ingredientCost: 6.0, wastePercentage: 10 },
      { id: 'ri-05', rawMaterialId: 'rm-21', rawMaterialName: 'Whole Cashew Nuts (Kaju W320)', quantity: 15, unit: 'GRAM', costPerUnit: 850, ingredientCost: 12.75, wastePercentage: 0 },
      { id: 'ri-06', rawMaterialId: 'rm-24', rawMaterialName: 'Kasuri Methi (Nagaur Special)', quantity: 5, unit: 'GRAM', costPerUnit: 320, ingredientCost: 1.6, wastePercentage: 0 },
      { id: 'ri-07', rawMaterialId: 'rm-13', rawMaterialName: 'Ginger Garlic Paste', quantity: 20, unit: 'GRAM', costPerUnit: 140, ingredientCost: 2.8, wastePercentage: 2 },
    ],
  },
  {
    id: 'rcp-02',
    brandId: 'brand-restodesk-001',
    itemId: 'itm-01',
    itemName: 'Paneer Tikka Angara',
    categoryName: 'Tandoori & Starters',
    menuPrice: 340.0,
    yieldQuantity: 1,
    instructions: 'Cut fresh malai paneer into 35g cubes. Toss with capsicum, onion petals, hung curd, deggi mirch, and roasted gram flour. Skewer and roast in clay oven at 300°C for 10 mins.',
    totalFoodCost: 91.2,
    foodCostPercentage: 26.8, // Healthy food cost
    grossMarginPercentage: 73.2,
    ingredients: [
      { id: 'ri-08', rawMaterialId: 'rm-01', rawMaterialName: 'Fresh Malai Paneer', quantity: 220, unit: 'GRAM', costPerUnit: 340, ingredientCost: 74.8, wastePercentage: 3 },
      { id: 'ri-09', rawMaterialId: 'rm-06', rawMaterialName: 'Thick Hung Curd (Dahi)', quantity: 50, unit: 'GRAM', costPerUnit: 90, ingredientCost: 4.5, wastePercentage: 2 },
      { id: 'ri-10', rawMaterialId: 'rm-15', rawMaterialName: 'Green Bell Peppers (Capsicum)', quantity: 40, unit: 'GRAM', costPerUnit: 60, ingredientCost: 2.4, wastePercentage: 10 },
      { id: 'ri-11', rawMaterialId: 'rm-11', rawMaterialName: 'Nashik Red Onions', quantity: 40, unit: 'GRAM', costPerUnit: 35, ingredientCost: 1.4, wastePercentage: 10 },
      { id: 'ri-12', rawMaterialId: 'rm-22', rawMaterialName: 'Kashmiri Deggi Mirch Powder', quantity: 15, unit: 'GRAM', costPerUnit: 480, ingredientCost: 7.2, wastePercentage: 0 },
      { id: 'ri-13', rawMaterialId: 'rm-05', rawMaterialName: 'Pure Desi Cow Ghee', quantity: 10, unit: 'ML', costPerUnit: 680, ingredientCost: 6.8, wastePercentage: 0 },
    ],
  },
  {
    id: 'rcp-03',
    brandId: 'brand-restodesk-001',
    itemId: 'itm-12',
    itemName: 'Dal Makhani Special',
    categoryName: 'Main Course (Curries)',
    menuPrice: 320.0,
    yieldQuantity: 1,
    instructions: 'Slow-simmer black urad lentils overnight on low tandoor embers. Finish with white butter, fresh cream, tomato reduction, and degi mirch tadka.',
    totalFoodCost: 62.4,
    foodCostPercentage: 19.5, // High-margin signature dish
    grossMarginPercentage: 80.5,
    ingredients: [
      { id: 'ri-14', rawMaterialId: 'rm-18', rawMaterialName: 'Black Urad Dal (Makhani Special)', quantity: 120, unit: 'GRAM', costPerUnit: 140, ingredientCost: 16.8, wastePercentage: 2 },
      { id: 'ri-15', rawMaterialId: 'rm-02', rawMaterialName: 'Amul Butter (Salted)', quantity: 50, unit: 'GRAM', costPerUnit: 520, ingredientCost: 26.0, wastePercentage: 0 },
      { id: 'ri-16', rawMaterialId: 'rm-03', rawMaterialName: 'Amul Fresh Cooking Cream', quantity: 35, unit: 'ML', costPerUnit: 220, ingredientCost: 7.7, wastePercentage: 2 },
      { id: 'ri-17', rawMaterialId: 'rm-12', rawMaterialName: 'Ripe Hybrid Tomatoes', quantity: 120, unit: 'GRAM', costPerUnit: 40, ingredientCost: 4.8, wastePercentage: 5 },
      { id: 'ri-18', rawMaterialId: 'rm-13', rawMaterialName: 'Ginger Garlic Paste', quantity: 20, unit: 'GRAM', costPerUnit: 140, ingredientCost: 2.8, wastePercentage: 2 },
    ],
  },
  {
    id: 'rcp-04',
    brandId: 'brand-restodesk-001',
    itemId: 'itm-21',
    itemName: 'Hyderabadi Chicken Dum Biryani',
    categoryName: 'Biryani & Rice Bowls',
    menuPrice: 390.0,
    yieldQuantity: 1,
    instructions: 'Layer aged Daawat basmati rice with marinated chicken, saffron milk, fried onions (birista), fresh mint and shahi potli spices. Dum-cook sealed with dough.',
    totalFoodCost: 112.8,
    foodCostPercentage: 28.9,
    grossMarginPercentage: 71.1,
    ingredients: [
      { id: 'ri-19', rawMaterialId: 'rm-08', rawMaterialName: 'Tandoori Whole Chicken (Curry Cut)', quantity: 260, unit: 'GRAM', costPerUnit: 220, ingredientCost: 57.2, wastePercentage: 5 },
      { id: 'ri-20', rawMaterialId: 'rm-17', rawMaterialName: 'Royal Basmati Rice (Daawat Biryani)', quantity: 180, unit: 'GRAM', costPerUnit: 125, ingredientCost: 22.5, wastePercentage: 2 },
      { id: 'ri-21', rawMaterialId: 'rm-05', rawMaterialName: 'Pure Desi Cow Ghee', quantity: 25, unit: 'ML', costPerUnit: 680, ingredientCost: 17.0, wastePercentage: 0 },
      { id: 'ri-22', rawMaterialId: 'rm-11', rawMaterialName: 'Nashik Red Onions (Birista)', quantity: 100, unit: 'GRAM', costPerUnit: 35, ingredientCost: 3.5, wastePercentage: 15 },
      { id: 'ri-23', rawMaterialId: 'rm-23', rawMaterialName: 'Royal Shahi Biryani Potli Masala', quantity: 12, unit: 'GRAM', costPerUnit: 720, ingredientCost: 8.64, wastePercentage: 0 },
      { id: 'ri-24', rawMaterialId: 'rm-26', rawMaterialName: 'Food Grade Biryani Handi', quantity: 1, unit: 'PIECE', costPerUnit: 24, ingredientCost: 24.0, wastePercentage: 0 },
    ],
  },
  {
    id: 'rcp-05',
    brandId: 'brand-restodesk-001',
    itemId: 'itm-34',
    itemName: 'Special Mango Lassi',
    categoryName: 'Beverages & Mocktails',
    menuPrice: 180.0,
    yieldQuantity: 1,
    instructions: 'Blend thick chilled curd with sweet Alphonso mango pulp, cardamom pinch, sugar, and milk. Serve in tall earthen kulhad with chopped pistachio.',
    totalFoodCost: 34.6,
    foodCostPercentage: 19.2, // Outstanding high-margin beverage
    grossMarginPercentage: 80.8,
    ingredients: [
      { id: 'ri-25', rawMaterialId: 'rm-06', rawMaterialName: 'Thick Hung Curd (Dahi)', quantity: 150, unit: 'GRAM', costPerUnit: 90, ingredientCost: 13.5, wastePercentage: 2 },
      { id: 'ri-26', rawMaterialId: 'rm-25', rawMaterialName: 'Alphonso Mango Pulp (Tin 850g)', quantity: 80, unit: 'GRAM', costPerUnit: 180, ingredientCost: 16.9, wastePercentage: 2 },
      { id: 'ri-27', rawMaterialId: 'rm-04', rawMaterialName: 'Full Cream Milk', quantity: 60, unit: 'ML', costPerUnit: 68, ingredientCost: 4.1, wastePercentage: 1 },
    ],
  },
];

export interface MockSupplier {
  id: string;
  brandId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  paymentTerms: string; // e.g. "Net 15 Days", "Net 30 Days", "Immediate UPI"
  outstandingBalance: number; // in INR
  totalPurchasesYtd: number;
}

export let MOCK_SUPPLIERS: MockSupplier[] = [
  {
    id: 'sup-01',
    brandId: 'brand-restodesk-001',
    name: 'Amul Dairy Distributors Ltd.',
    contactPerson: 'Kailash Sharma',
    phone: '9820011223',
    email: 'kailash.amul@dairy-supply.in',
    gstin: '29AAACA2101M1ZQ',
    address: 'Plot 44, Yeshwanthpur Industrial Area',
    city: 'Bengaluru',
    state: 'Karnataka',
    paymentTerms: 'Net 15 Days',
    outstandingBalance: 32450.0,
    totalPurchasesYtd: 384000.0,
  },
  {
    id: 'sup-02',
    brandId: 'brand-restodesk-001',
    name: 'FreshFarms Agro Produce Hub',
    contactPerson: 'Manjunath Reddy',
    phone: '9845012399',
    email: 'manju@freshfarms-blr.com',
    gstin: '29BBBCB5421N1ZT',
    address: 'Shed 12, APMC Yard, Yeshwanthpur',
    city: 'Bengaluru',
    state: 'Karnataka',
    paymentTerms: 'Weekly Settlement (Net 7)',
    outstandingBalance: 14800.0,
    totalPurchasesYtd: 215000.0,
  },
  {
    id: 'sup-03',
    brandId: 'brand-restodesk-001',
    name: 'Royal Spices & Staples Co.',
    contactPerson: 'Suresh Kumar Agrawal',
    phone: '9811054321',
    email: 'suresh@royalspices.co.in',
    gstin: '29CCCC8765P1ZL',
    address: '22, Mamulpet Main Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    paymentTerms: 'Net 30 Days',
    outstandingBalance: 48900.0,
    totalPurchasesYtd: 540000.0,
  },
  {
    id: 'sup-04',
    brandId: 'brand-restodesk-001',
    name: 'Delight Poultry & Seafood Ltd.',
    contactPerson: 'Zameer Ahmed',
    phone: '9880198765',
    email: 'zameer@delightpoultry.in',
    gstin: '29DDDDD4321R1ZX',
    address: '77, Shivaji Nagar Wholesale Market',
    city: 'Bengaluru',
    state: 'Karnataka',
    paymentTerms: 'Bi-Weekly (Net 14)',
    outstandingBalance: 28600.0,
    totalPurchasesYtd: 412000.0,
  },
  {
    id: 'sup-05',
    brandId: 'brand-restodesk-001',
    name: 'BakeCare Packaging & Eco Boxes',
    contactPerson: 'Deepak Joshi',
    phone: '9844077881',
    email: 'sales@bakecarepkg.com',
    gstin: '29EEEEE9876S1ZV',
    address: 'Peenya Industrial Area Stage II',
    city: 'Bengaluru',
    state: 'Karnataka',
    paymentTerms: 'Net 30 Days',
    outstandingBalance: 9500.0,
    totalPurchasesYtd: 98000.0,
  },
];

export interface MockPurchaseOrderItem {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface MockPurchaseOrder {
  id: string;
  brandId: string;
  outletId: string;
  outletName: string;
  supplierId: string;
  supplierName: string;
  poNumber: string;
  orderDate: string; // YYYY-MM-DD
  expectedDeliveryDate: string;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number;
  notes: string;
  items: MockPurchaseOrderItem[];
}

export let MOCK_PURCHASE_ORDERS: MockPurchaseOrder[] = [
  {
    id: 'po-101',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    supplierId: 'sup-01',
    supplierName: 'Amul Dairy Distributors Ltd.',
    poNumber: 'PO-202610-001',
    orderDate: '2026-10-26',
    expectedDeliveryDate: '2026-10-27',
    status: 'RECEIVED',
    totalAmount: 18400.0,
    notes: 'Urgent dairy replenishment for Diwali festive prep.',
    items: [
      { id: 'poi-1', rawMaterialId: 'rm-01', rawMaterialName: 'Fresh Malai Paneer', unit: 'KG', quantity: 25, unitPrice: 340, totalPrice: 8500 },
      { id: 'poi-2', rawMaterialId: 'rm-02', rawMaterialName: 'Amul Butter (Salted)', unit: 'KG', quantity: 15, unitPrice: 520, totalPrice: 7800 },
      { id: 'poi-3', rawMaterialId: 'rm-03', rawMaterialName: 'Amul Fresh Cooking Cream', unit: 'LITER', quantity: 10, unitPrice: 210, totalPrice: 2100 },
    ],
  },
  {
    id: 'po-102',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    supplierId: 'sup-04',
    supplierName: 'Delight Poultry & Seafood Ltd.',
    poNumber: 'PO-202610-002',
    orderDate: '2026-10-27',
    expectedDeliveryDate: '2026-10-29',
    status: 'ISSUED',
    totalAmount: 24700.0,
    notes: 'Daily poultry & mutton supplies. Delivery expected before 8:00 AM.',
    items: [
      { id: 'poi-4', rawMaterialId: 'rm-07', rawMaterialName: 'Boneless Chicken Breast Cubes', unit: 'KG', quantity: 40, unitPrice: 280, totalPrice: 11200 },
      { id: 'poi-5', rawMaterialId: 'rm-08', rawMaterialName: 'Tandoori Whole Chicken (Curry Cut)', unit: 'KG', quantity: 25, unitPrice: 220, totalPrice: 5500 },
      { id: 'poi-6', rawMaterialId: 'rm-09', rawMaterialName: 'Prime Tender Lamb Curry Cut', unit: 'KG', quantity: 10, unitPrice: 780, totalPrice: 7800 },
      { id: 'poi-7', rawMaterialId: 'rm-10', rawMaterialName: 'Fresh Freshwater Fish Fillet (Basa)', unit: 'KG', quantity: 5, unitPrice: 360, totalPrice: 1800 },
    ],
  },
  {
    id: 'po-103',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    supplierId: 'sup-03',
    supplierName: 'Royal Spices & Staples Co.',
    poNumber: 'PO-202610-003',
    orderDate: '2026-10-28',
    expectedDeliveryDate: '2026-10-31',
    status: 'ISSUED',
    totalAmount: 32650.0,
    notes: 'Bulk grains, basmati rice and whole spices reorder.',
    items: [
      { id: 'poi-8', rawMaterialId: 'rm-17', rawMaterialName: 'Royal Basmati Rice (Daawat Biryani)', unit: 'KG', quantity: 150, unitPrice: 125, totalPrice: 18750 },
      { id: 'poi-9', rawMaterialId: 'rm-18', rawMaterialName: 'Black Urad Dal (Makhani Special)', unit: 'KG', quantity: 40, unitPrice: 140, totalPrice: 5600 },
      { id: 'poi-10', rawMaterialId: 'rm-21', rawMaterialName: 'Whole Cashew Nuts (Kaju W320)', unit: 'KG', quantity: 8, unitPrice: 850, totalPrice: 6800 },
      { id: 'poi-11', rawMaterialId: 'rm-24', rawMaterialName: 'Kasuri Methi (Nagaur Special)', unit: 'KG', quantity: 5, unitPrice: 300, totalPrice: 1500 },
    ],
  },
  {
    id: 'po-104',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-02',
    outletName: 'Whitefield Tech Park',
    supplierId: 'sup-02',
    supplierName: 'FreshFarms Agro Produce Hub',
    poNumber: 'PO-202610-004',
    orderDate: '2026-10-28',
    expectedDeliveryDate: '2026-10-29',
    status: 'DRAFT',
    totalAmount: 6850.0,
    notes: 'Draft order for fresh greens and daily vegetables.',
    items: [
      { id: 'poi-12', rawMaterialId: 'rm-11', rawMaterialName: 'Nashik Red Onions', unit: 'KG', quantity: 50, unitPrice: 35, totalPrice: 1750 },
      { id: 'poi-13', rawMaterialId: 'rm-12', rawMaterialName: 'Ripe Hybrid Tomatoes', unit: 'KG', quantity: 40, unitPrice: 40, totalPrice: 1600 },
      { id: 'poi-14', rawMaterialId: 'rm-13', rawMaterialName: 'Ginger Garlic Paste', unit: 'KG', quantity: 20, unitPrice: 140, totalPrice: 2800 },
      { id: 'poi-15', rawMaterialId: 'rm-16', rawMaterialName: 'Fresh Mint & Coriander Leaves', unit: 'KG', quantity: 10, unitPrice: 70, totalPrice: 700 },
    ],
  },
];

export interface MockGRNItem {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  unit: string;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  unitPrice: number;
  totalAmount: number;
}

export interface MockGRN {
  id: string;
  brandId: string;
  outletId: string;
  outletName: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId?: string;
  poNumber?: string;
  grnNumber: string;
  invoiceNumber: string;
  receivedDate: string;
  totalAmount: number;
  status: 'DRAFT' | 'VERIFIED' | 'REJECTED';
  notes: string;
  items: MockGRNItem[];
}

export let MOCK_GRNS: MockGRN[] = [
  {
    id: 'grn-101',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    supplierId: 'sup-01',
    supplierName: 'Amul Dairy Distributors Ltd.',
    purchaseOrderId: 'po-101',
    poNumber: 'PO-202610-001',
    grnNumber: 'GRN-202610-011',
    invoiceNumber: 'INV-AMUL-8821',
    receivedDate: '2026-10-27',
    totalAmount: 18400.0,
    status: 'VERIFIED',
    notes: 'Temperature checked at delivery (+4°C). All dairy crates sealed with batch QC passed.',
    items: [
      { id: 'gi-1', rawMaterialId: 'rm-01', rawMaterialName: 'Fresh Malai Paneer', unit: 'KG', receivedQty: 25, acceptedQty: 25, rejectedQty: 0, unitPrice: 340, totalAmount: 8500 },
      { id: 'gi-2', rawMaterialId: 'rm-02', rawMaterialName: 'Amul Butter (Salted)', unit: 'KG', receivedQty: 15, acceptedQty: 15, rejectedQty: 0, unitPrice: 520, totalAmount: 7800 },
      { id: 'gi-3', rawMaterialId: 'rm-03', rawMaterialName: 'Amul Fresh Cooking Cream', unit: 'LITER', receivedQty: 10, acceptedQty: 10, rejectedQty: 0, unitPrice: 210, totalAmount: 2100 },
    ],
  },
];

export interface MockWastage {
  id: string;
  outletId: string;
  wastageNumber: string;
  date: string;
  reason: 'Spoilage' | 'Preparation Error' | 'Burning' | 'Expiry' | 'Spillage';
  totalCost: number;
  recordedBy: string;
  items: Array<{
    id: string;
    rawMaterialId: string;
    rawMaterialName: string;
    unit: string;
    quantity: number;
    cost: number;
    notes?: string;
  }>;
}

export let MOCK_WASTAGE: MockWastage[] = [
  {
    id: 'wst-01',
    outletId: 'outlet-01',
    wastageNumber: 'WST-202610-001',
    date: '2026-10-25',
    reason: 'Preparation Error',
    totalCost: 680.0,
    recordedBy: 'Chef Sanjay Rawat',
    items: [
      { id: 'wi-1', rawMaterialId: 'rm-01', rawMaterialName: 'Fresh Malai Paneer', unit: 'KG', quantity: 2.0, cost: 680.0, notes: 'Over-salted marinade batch discarded' },
    ],
  },
  {
    id: 'wst-02',
    outletId: 'outlet-01',
    wastageNumber: 'WST-202610-002',
    date: '2026-10-27',
    reason: 'Spoilage',
    totalCost: 320.0,
    recordedBy: 'Chef Sanjay Rawat',
    items: [
      { id: 'wi-2', rawMaterialId: 'rm-12', rawMaterialName: 'Ripe Hybrid Tomatoes', unit: 'KG', quantity: 4.0, cost: 160.0, notes: 'Bruised bottom crates from market delivery' },
      { id: 'wi-3', rawMaterialId: 'rm-16', rawMaterialName: 'Fresh Mint & Coriander Leaves', unit: 'KG', quantity: 2.0, cost: 160.0, notes: 'Wilted from high humidity' },
    ],
  },
];

// ==========================================
// STOCK IN / OUT MOVEMENT LEDGER
// ==========================================

export type StockMovementType =
  | 'STOCK_IN'              // Goods received from supplier (GRN) or stock replenishment
  | 'RECIPE_CONSUMPTION'    // Deducted automatically when dishes are ordered in POS / aggregators
  | 'WASTAGE'               // Kitchen spoilage, burning, expired items
  | 'MANUAL_ADJUSTMENT'     // Manual addition/subtraction by manager
  | 'AUDIT_RECONCILIATION'; // Discrepancy reconciled during physical stock count

export interface MockStockMovement {
  id: string;
  brandId: string;
  outletId: string;
  date: string; // ISO 8601 string
  rawMaterialId: string;
  rawMaterialName: string;
  sku: string;
  category: string;
  unit: string;
  type: StockMovementType;
  changeQty: number; // positive for IN (+), negative for OUT (-)
  balanceAfter: number;
  costPerUnit: number;
  totalCostImpact: number;
  reference: string; // e.g. "GRN #GRN-202610-001 (Amul Dairy)" or "POS Order #ORD-20261031-102"
  recordedBy: string; // e.g. "POS Recipe BOM Engine", "Chef Sanjay Rawat", "Store Manager"
  notes?: string;
}

export let MOCK_STOCK_MOVEMENTS: MockStockMovement[] = [
  {
    id: 'mov-001',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    date: '2026-10-27T08:30:00.000Z',
    rawMaterialId: 'rm-01',
    rawMaterialName: 'Fresh Malai Paneer',
    sku: 'RM-PAN-01',
    category: 'Dairy',
    unit: 'KG',
    type: 'STOCK_IN',
    changeQty: 25.0,
    balanceAfter: 20.5,
    costPerUnit: 340.0,
    totalCostImpact: 8500.0,
    reference: 'GRN #GRN-202610-001 (Amul Dairy Distributors Ltd.)',
    recordedBy: 'Store Supervisor',
    notes: 'Verified against PO-202610-001 invoice #AM-8841',
  },
  {
    id: 'mov-002',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    date: '2026-10-27T08:30:00.000Z',
    rawMaterialId: 'rm-02',
    rawMaterialName: 'Amul Butter (Salted)',
    sku: 'RM-BUT-01',
    category: 'Dairy',
    unit: 'KG',
    type: 'STOCK_IN',
    changeQty: 15.0,
    balanceAfter: 12.0,
    costPerUnit: 520.0,
    totalCostImpact: 7800.0,
    reference: 'GRN #GRN-202610-001 (Amul Dairy Distributors Ltd.)',
    recordedBy: 'Store Supervisor',
    notes: 'Cold storage received at 4°C',
  },
  {
    id: 'mov-003',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    date: '2026-10-27T08:30:00.000Z',
    rawMaterialId: 'rm-03',
    rawMaterialName: 'Amul Fresh Cooking Cream',
    sku: 'RM-CRM-01',
    category: 'Dairy',
    unit: 'LITER',
    type: 'STOCK_IN',
    changeQty: 10.0,
    balanceAfter: 6.5,
    costPerUnit: 220.0,
    totalCostImpact: 2200.0,
    reference: 'GRN #GRN-202610-001 (Amul Dairy Distributors Ltd.)',
    recordedBy: 'Store Supervisor',
    notes: 'Batch exp: Nov 2026',
  },
  {
    id: 'mov-004',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    date: '2026-10-27T11:15:00.000Z',
    rawMaterialId: 'rm-01',
    rawMaterialName: 'Fresh Malai Paneer',
    sku: 'RM-PAN-01',
    category: 'Dairy',
    unit: 'KG',
    type: 'WASTAGE',
    changeQty: -2.0,
    balanceAfter: 18.5,
    costPerUnit: 340.0,
    totalCostImpact: -680.0,
    reference: 'Wastage Log #WST-202610-001',
    recordedBy: 'Chef Sanjay Rawat',
    notes: 'Preparation Error: Over-salted marinade batch discarded',
  },
  {
    id: 'mov-005',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    date: '2026-10-28T10:45:00.000Z',
    rawMaterialId: 'rm-12',
    rawMaterialName: 'Ripe Hybrid Tomatoes',
    sku: 'RM-VEG-02',
    category: 'Produce & Veg',
    unit: 'KG',
    type: 'WASTAGE',
    changeQty: -4.0,
    balanceAfter: 45.0,
    costPerUnit: 40.0,
    totalCostImpact: -160.0,
    reference: 'Wastage Log #WST-202610-002',
    recordedBy: 'Chef Sanjay Rawat',
    notes: 'Spoilage: Bruised bottom crates from market delivery',
  },
  {
    id: 'mov-006',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    date: '2026-10-28T10:45:00.000Z',
    rawMaterialId: 'rm-16',
    rawMaterialName: 'Fresh Mint & Coriander Leaves',
    sku: 'RM-VEG-06',
    category: 'Produce & Veg',
    unit: 'KG',
    type: 'WASTAGE',
    changeQty: -2.0,
    balanceAfter: 4.5,
    costPerUnit: 80.0,
    totalCostImpact: -160.0,
    reference: 'Wastage Log #WST-202610-002',
    recordedBy: 'Chef Sanjay Rawat',
    notes: 'Spoilage: Wilted from high humidity',
  },
  {
    id: 'mov-007',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    date: '2026-10-29T13:40:00.000Z',
    rawMaterialId: 'rm-07',
    rawMaterialName: 'Boneless Chicken Breast Cubes',
    sku: 'RM-CHK-01',
    category: 'Poultry & Meat',
    unit: 'KG',
    type: 'RECIPE_CONSUMPTION',
    changeQty: -0.75,
    balanceAfter: 22.0,
    costPerUnit: 280.0,
    totalCostImpact: -210.0,
    reference: 'POS Order #ORD-20261029-105 (3x Butter Chicken)',
    recordedBy: 'Auto Recipe BOM Engine',
    notes: '250g chicken per portion deducted on order punch',
  },
  {
    id: 'mov-008',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    date: '2026-10-29T13:40:00.000Z',
    rawMaterialId: 'rm-02',
    rawMaterialName: 'Amul Butter (Salted)',
    sku: 'RM-BUT-01',
    category: 'Dairy',
    unit: 'KG',
    type: 'RECIPE_CONSUMPTION',
    changeQty: -0.12,
    balanceAfter: 12.0,
    costPerUnit: 520.0,
    totalCostImpact: -62.4,
    reference: 'POS Order #ORD-20261029-105 (3x Butter Chicken)',
    recordedBy: 'Auto Recipe BOM Engine',
    notes: '40g butter per portion deducted',
  },
  {
    id: 'mov-009',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    date: '2026-10-29T14:10:00.000Z',
    rawMaterialId: 'rm-01',
    rawMaterialName: 'Fresh Malai Paneer',
    sku: 'RM-PAN-01',
    category: 'Dairy',
    unit: 'KG',
    type: 'RECIPE_CONSUMPTION',
    changeQty: -0.44,
    balanceAfter: 18.5,
    costPerUnit: 340.0,
    totalCostImpact: -149.6,
    reference: 'POS Order #ORD-20261029-108 (2x Paneer Tikka)',
    recordedBy: 'Auto Recipe BOM Engine',
    notes: '220g malai paneer per portion deducted',
  },
  {
    id: 'mov-010',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    date: '2026-10-30T19:25:00.000Z',
    rawMaterialId: 'rm-17',
    rawMaterialName: 'Royal Basmati Rice (Daawat Biryani)',
    sku: 'RM-GRN-01',
    category: 'Grains & Staples',
    unit: 'KG',
    type: 'RECIPE_CONSUMPTION',
    changeQty: -0.90,
    balanceAfter: 110.0,
    costPerUnit: 125.0,
    totalCostImpact: -112.5,
    reference: 'POS Order #ORD-20261030-112 (5x Chicken Dum Biryani)',
    recordedBy: 'Auto Recipe BOM Engine',
    notes: '180g aged basmati rice per portion deducted',
  },
  {
    id: 'mov-011',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    date: '2026-10-31T09:00:00.000Z',
    rawMaterialId: 'rm-11',
    rawMaterialName: 'Nashik Red Onions',
    sku: 'RM-VEG-01',
    category: 'Produce & Veg',
    unit: 'KG',
    type: 'AUDIT_RECONCILIATION',
    changeQty: 5.0,
    balanceAfter: 85.0,
    costPerUnit: 35.0,
    totalCostImpact: 175.0,
    reference: 'Physical Stock Audit',
    recordedBy: 'Store Manager',
    notes: 'Physical count reconciled: found 1 extra 5kg bag in dry store',
  },
  {
    id: 'mov-012',
    brandId: 'brand-restodesk-001',
    outletId: 'outlet-01',
    date: '2026-10-31T11:30:00.000Z',
    rawMaterialId: 'rm-03',
    rawMaterialName: 'Amul Fresh Cooking Cream',
    sku: 'RM-CRM-01',
    category: 'Dairy',
    unit: 'LITER',
    type: 'MANUAL_ADJUSTMENT',
    changeQty: 2.0,
    balanceAfter: 6.5,
    costPerUnit: 220.0,
    totalCostImpact: 440.0,
    reference: 'Manual Quick Adjust',
    recordedBy: 'Kitchen Supervisor',
    notes: 'Stock replenishment from emergency local store purchase',
  },
];

export function recordStockMovement(
  movement: Omit<MockStockMovement, 'id' | 'brandId' | 'outletId'> & {
    id?: string;
    brandId?: string;
    outletId?: string;
  }
): MockStockMovement {
  const newMovement: MockStockMovement = {
    id: movement.id || `mov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    brandId: movement.brandId || 'brand-restodesk-001',
    outletId: movement.outletId || 'outlet-01',
    ...movement,
  };
  MOCK_STOCK_MOVEMENTS.unshift(newMovement);
  return newMovement;
}

// ==========================================
// PHASE 6: SHIFTS, CASH DRAWER, Z-REPORTS & ANALYTICS
// ==========================================

export interface MockShift {
  id: string;
  outletId: string;
  outletName: string;
  shiftNumber: number;
  cashierId: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  status: 'ACTIVE' | 'CLOSED';
  openingCash: number;
  cashSales: number;
  cashInFlow: number;
  cashExpenses: number;
  expectedCash: number;
  actualCash: number;
  variance: number;
  notes: string;
  cashDrawerEntries: Array<{
    id: string;
    time: string;
    type: 'FLOAT_IN' | 'EXPENSE_OUT' | 'CASH_SALE' | 'PAYOUT';
    amount: number;
    note: string;
  }>;
}

export let MOCK_ACTIVE_SHIFT: MockShift = {
  id: 'shift-20261028-01',
  outletId: 'outlet-01',
  outletName: 'Indiranagar Flagship',
  shiftNumber: 1,
  cashierId: 'usr-cashier-01',
  cashierName: 'Kavita Sen',
  startTime: '2026-10-28T11:00:00.000Z',
  status: 'ACTIVE',
  openingCash: 5000.0,
  cashSales: 34850.0,
  cashInFlow: 1500.0,
  cashExpenses: 1200.0,
  expectedCash: 40150.0, // 5000 + 34850 + 1500 - 1200
  actualCash: 40150.0,
  variance: 0.0,
  notes: 'Regular active shift. Cash drawer balanced.',
  cashDrawerEntries: [
    { id: 'cde-1', time: '11:00 AM', type: 'FLOAT_IN', amount: 5000.0, note: 'Opening cash float from safe' },
    { id: 'cde-2', time: '01:30 PM', type: 'EXPENSE_OUT', amount: -450.0, note: 'Emergency ice bags purchase' },
    { id: 'cde-3', time: '03:15 PM', type: 'EXPENSE_OUT', amount: -750.0, note: 'Local courier & fuel expense' },
    { id: 'cde-4', time: '04:00 PM', type: 'FLOAT_IN', amount: 1500.0, note: 'Additional coins & ₹100 change float' },
  ],
};

export interface MockZReport {
  id: string;
  zReportNumber: string;
  businessDate: string; // YYYY-MM-DD
  generatedAt: string;
  generatedBy: string;
  outletId: string;
  outletName: string;
  grossSales: number;
  itemDiscounts: number;
  billDiscounts: number;
  netSales: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  totalGst: number;
  packagingCharge: number;
  deliveryCharge: number;
  roundOff: number;
  finalTotal: number;
  paymentBreakdown: {
    cash: number;
    cashOrders: number;
    upi: number;
    upiOrders: number;
    card: number;
    cardOrders: number;
    wallet: number;
    walletOrders: number;
    loyaltyPoints: number;
  };
  orderTypeBreakdown: {
    dineInSales: number;
    dineInOrders: number;
    takeawaySales: number;
    takeawayOrders: number;
    onlineSales: number;
    onlineOrders: number;
  };
  totalOrders: number;
  voidedOrdersCount: number;
  voidedTotalAmount: number;
  cashReconciliation: {
    openingFloat: number;
    cashSales: number;
    cashExpenses: number;
    expectedCash: number;
    actualCash: number;
    variance: number;
  };
}

export let MOCK_Z_REPORTS: MockZReport[] = [
  {
    id: 'z-20261027-01',
    zReportNumber: 'Z-20261027-001',
    businessDate: '2026-10-27',
    generatedAt: '2026-10-27T23:55:00.000Z',
    generatedBy: 'Ramesh Patel (General Manager)',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    grossSales: 154200.0,
    itemDiscounts: 3400.0,
    billDiscounts: 4200.0,
    netSales: 146600.0,
    taxableAmount: 139619.0,
    cgst: 3490.5,
    sgst: 3490.5,
    totalGst: 6981.0,
    packagingCharge: 1950.0,
    deliveryCharge: 850.0,
    roundOff: -0.0,
    finalTotal: 156381.0,
    paymentBreakdown: {
      cash: 42800.0,
      cashOrders: 44,
      upi: 74600.0,
      upiOrders: 78,
      card: 31200.0,
      cardOrders: 28,
      wallet: 5400.0,
      walletOrders: 7,
      loyaltyPoints: 2381.0,
    },
    orderTypeBreakdown: {
      dineInSales: 104200.0,
      dineInOrders: 88,
      takeawaySales: 26400.0,
      takeawayOrders: 34,
      onlineSales: 25781.0,
      onlineOrders: 35,
    },
    totalOrders: 157,
    voidedOrdersCount: 2,
    voidedTotalAmount: 1480.0,
    cashReconciliation: {
      openingFloat: 5000.0,
      cashSales: 42800.0,
      cashExpenses: 1250.0,
      expectedCash: 46550.0,
      actualCash: 46500.0,
      variance: -50.0,
    },
  },
  {
    id: 'z-20261026-01',
    zReportNumber: 'Z-20261026-001',
    businessDate: '2026-10-26',
    generatedAt: '2026-10-26T23:50:00.000Z',
    generatedBy: 'Ramesh Patel (General Manager)',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    grossSales: 138900.0,
    itemDiscounts: 2800.0,
    billDiscounts: 3500.0,
    netSales: 132600.0,
    taxableAmount: 126285.0,
    cgst: 3157.0,
    sgst: 3157.0,
    totalGst: 6314.0,
    packagingCharge: 1650.0,
    deliveryCharge: 720.0,
    roundOff: 0.0,
    finalTotal: 141284.0,
    paymentBreakdown: {
      cash: 38400.0,
      cashOrders: 40,
      upi: 66800.0,
      upiOrders: 70,
      card: 28900.0,
      cardOrders: 24,
      wallet: 4600.0,
      walletOrders: 5,
      loyaltyPoints: 2584.0,
    },
    orderTypeBreakdown: {
      dineInSales: 92800.0,
      dineInOrders: 78,
      takeawaySales: 24200.0,
      takeawayOrders: 30,
      onlineSales: 24284.0,
      onlineOrders: 31,
    },
    totalOrders: 139,
    voidedOrdersCount: 1,
    voidedTotalAmount: 650.0,
    cashReconciliation: {
      openingFloat: 5000.0,
      cashSales: 38400.0,
      cashExpenses: 900.0,
      expectedCash: 42500.0,
      actualCash: 42500.0,
      variance: 0.0,
    },
  },
];

export let MOCK_HOURLY_SALES = [
  { hour: '11 AM', sales: 4200, orders: 4 },
  { hour: '12 PM', sales: 12800, orders: 12 },
  { hour: '01 PM', sales: 24600, orders: 22 },
  { hour: '02 PM', sales: 28400, orders: 25 },
  { hour: '03 PM', sales: 11200, orders: 10 },
  { hour: '04 PM', sales: 5400, orders: 5 },
  { hour: '05 PM', sales: 6800, orders: 6 },
  { hour: '06 PM', sales: 9400, orders: 9 },
  { hour: '07 PM', sales: 18900, orders: 16 },
  { hour: '08 PM', sales: 32600, orders: 28 },
  { hour: '09 PM', sales: 38400, orders: 32 },
  { hour: '10 PM', sales: 22800, orders: 18 },
  { hour: '11 PM', sales: 7400, orders: 6 },
];

export let MOCK_PAYMENT_SPLIT = [
  { name: 'UPI / QR', value: 74600, percent: 48, color: '#10b981' },
  { name: 'Cash', value: 42800, percent: 27, color: '#f59e0b' },
  { name: 'Credit/Debit Card', value: 31200, percent: 20, color: '#6366f1' },
  { name: 'Digital Wallet', value: 5400, percent: 3.5, color: '#8b5cf6' },
  { name: 'Points Redemption', value: 2381, percent: 1.5, color: '#ec4899' },
];

export let MOCK_ORDER_TYPE_SPLIT = [
  { name: 'Dine-In', sales: 104200, orders: 88, percent: 67, color: '#10b981' },
  { name: 'Takeaway / Parcel', sales: 26400, orders: 34, percent: 17, color: '#3b82f6' },
  { name: 'Online (Zomato/Swiggy)', sales: 25781, orders: 35, percent: 16, color: '#f97316' },
];

export let MOCK_TOP_ITEMS_SALES = [
  { rank: 1, name: 'Butter Chicken Old Delhi Style', category: 'Curries', qtySold: 42, revenue: 17640, foodCostPct: 28.2 },
  { rank: 2, name: 'Hyderabadi Chicken Dum Biryani', category: 'Biryani', qtySold: 38, revenue: 14440, foodCostPct: 28.9 },
  { rank: 3, name: 'Paneer Tikka Angara', category: 'Starters', qtySold: 36, revenue: 12240, foodCostPct: 26.8 },
  { rank: 4, name: 'Dal Makhani Special', category: 'Curries', qtySold: 34, revenue: 10880, foodCostPct: 19.5 },
  { rank: 5, name: 'Garlic Butter Naan', category: 'Breads', qtySold: 114, revenue: 9690, foodCostPct: 18.0 },
  { rank: 6, name: 'Murgh Malai Tikka', category: 'Starters', qtySold: 24, revenue: 9360, foodCostPct: 29.5 },
  { rank: 7, name: 'Amritsari Fish Fry', category: 'Starters', qtySold: 18, revenue: 7920, foodCostPct: 32.0 },
  { rank: 8, name: 'Special Mango Lassi', category: 'Beverages', qtySold: 42, revenue: 7560, foodCostPct: 19.2 },
  { rank: 9, name: 'Tandoori Roti (Butter)', category: 'Breads', qtySold: 140, revenue: 5600, foodCostPct: 16.5 },
  { rank: 10, name: 'Gulab Jamun with Rabri', category: 'Desserts', qtySold: 28, revenue: 5040, foodCostPct: 21.0 },
];

// ============================================================================
// PHASE 7: CAMPAIGNS, AUTOMATION JOURNEYS & FEEDBACK / REVIEWS
// ============================================================================

export type CampaignChannelType = 'WHATSAPP' | 'SMS' | 'EMAIL';
export type CampaignStatusType = 'DRAFT' | 'SCHEDULED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
export type DeliveryStatusType = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
export type JourneyTriggerType = 'WELCOME' | 'BIRTHDAY' | 'ANNIVERSARY' | 'POST_VISIT' | 'WIN_BACK' | 'POINTS_EXPIRY';

export interface MessageTemplateItem {
  id: string;
  brandId: string;
  name: string;
  channel: CampaignChannelType;
  content: string;
  header?: string;
  footer?: string;
  sampleVariables?: string;
  isApproved: boolean;
  category: 'PROMOTIONAL' | 'TRANSACTIONAL' | 'FEEDBACK' | 'GREETING';
  createdAt: string;
}

export interface CampaignRecipientItem {
  id: string;
  campaignId: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email?: string;
  status: DeliveryStatusType;
  errorDetails?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface CampaignItem {
  id: string;
  brandId: string;
  name: string;
  channel: CampaignChannelType;
  segmentId?: string;
  segmentName?: string;
  templateId?: string;
  templateName?: string;
  couponId?: string;
  couponCode?: string;
  scheduledAt?: string;
  status: CampaignStatusType;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  convertedCount: number;
  revenueAttributed: number;
  costIncurred: number;
  createdAt: string;
  updatedAt: string;
}

export interface JourneyStepItem {
  id: string;
  journeyId: string;
  stepOrder: number;
  delayHours: number;
  channel: CampaignChannelType;
  templateId?: string;
  templateName?: string;
  templateContent: string;
}

export interface JourneyItem {
  id: string;
  brandId: string;
  name: string;
  triggerType: JourneyTriggerType;
  description: string;
  isActive: boolean;
  totalTriggered: number;
  conversions: number;
  revenueAttributed: number;
  steps: JourneyStepItem[];
  createdAt: string;
}

export interface FeedbackQuestionItem {
  id: string;
  feedbackFormId: string;
  questionText: string;
  questionType: 'STAR_RATING' | 'NPS_SCALE' | 'EMOJI' | 'TEXT';
  categoryKey: 'food' | 'service' | 'ambiance' | 'cleanliness' | 'value' | 'nps' | 'comment';
  isRequired: boolean;
  sortOrder: number;
}

export interface FeedbackFormItem {
  id: string;
  brandId: string;
  outletId?: string;
  title: string;
  description?: string;
  isActive: boolean;
  googleReviewUrl: string;
  questions: FeedbackQuestionItem[];
}

export interface FeedbackResponseItem {
  id: string;
  feedbackFormId: string;
  outletId: string;
  outletName: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  orderId?: string;
  billNumber?: string;
  tableNumber?: string;
  overallRating: number;
  foodRating: number;
  serviceRating: number;
  ambianceRating: number;
  npsScore: number; // 0 to 10
  npsCategory: 'PROMOTER' | 'PASSIVE' | 'DETRACTOR';
  comments?: string;
  answersJson?: Record<string, any>;
  isResolved: boolean;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  redirectedToGoogle: boolean;
  createdAt: string;
}

// ----------------------------------------------------
// SEED DATA: MESSAGE TEMPLATES
// ----------------------------------------------------
export let MOCK_MESSAGE_TEMPLATES: MessageTemplateItem[] = [
  {
    id: 'tmpl-01',
    brandId: 'brand-01',
    name: 'Weekend Feast 20% WhatsApp',
    channel: 'WHATSAPP',
    category: 'PROMOTIONAL',
    header: 'Weekend Special at RestoDesk! 🍽️',
    content: 'Hi {name}! Treat yourself this weekend at {outlet}. Enjoy flat 20% OFF using coupon {coupon}. Plus, you have {points} loyalty points ready to redeem on your bill! Valid till Sunday midnight.',
    footer: 'Reply STOP to unsubscribe • RestoDesk',
    sampleVariables: '{name}=Rahul, {outlet}=Indiranagar, {coupon}=WEEKEND20, {points}=240',
    isApproved: true,
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'tmpl-02',
    brandId: 'brand-01',
    name: 'Birthday Royal Celebration WhatsApp',
    channel: 'WHATSAPP',
    category: 'GREETING',
    header: 'Happy Birthday from RestoDesk! 🎂',
    content: 'Dear {name}, wishing you a joyful Birthday! Celebrate your day with a complimentary Chef\'s Special Dessert and ₹300 OFF on your party bill at {outlet} using code {coupon}. We look forward to hosting you!',
    footer: 'Show this message during billing • RestoDesk',
    sampleVariables: '{name}=Priya, {outlet}=Indiranagar, {coupon}=BDAY300',
    isApproved: true,
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'tmpl-03',
    brandId: 'brand-01',
    name: 'Welcome Sign-Up Voucher SMS',
    channel: 'SMS',
    category: 'TRANSACTIONAL',
    content: 'Welcome to RestoDesk, {name}! Enjoy flat Rs.150 OFF on your first dining or takeaway bill with code {coupon}. T&C apply.',
    sampleVariables: '{name}=Aditya, {coupon}=WELCOME150',
    isApproved: true,
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'tmpl-04',
    brandId: 'brand-01',
    name: 'Win-Back Lapsed Diner SMS',
    channel: 'SMS',
    category: 'PROMOTIONAL',
    content: 'We miss you at {outlet}, {name}! Craving your favorites? Visit us this week & get 15% OFF with code {coupon}. Valid for 7 days.',
    sampleVariables: '{name}=Neha, {outlet}=Indiranagar, {coupon}=COMEBACK15',
    isApproved: true,
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'tmpl-05',
    brandId: 'brand-01',
    name: 'Post-Visit Dining Feedback WhatsApp',
    channel: 'WHATSAPP',
    category: 'FEEDBACK',
    header: 'How was your meal today? ⭐',
    content: 'Hi {name}, thank you for dining with us today at {outlet}! We would love to know how your food and service were. Tap the link to rate your experience in 30 seconds: {review_link}',
    footer: 'Your feedback helps us serve you better • RestoDesk',
    sampleVariables: '{name}=Karthik, {outlet}=Koramangala, {review_link}=https://restodesk.in/review/fb-101',
    isApproved: true,
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'tmpl-06',
    brandId: 'brand-01',
    name: 'Points Expiry Alert SMS',
    channel: 'SMS',
    category: 'TRANSACTIONAL',
    content: 'Alert: Your {points} RestoDesk reward points worth Rs.{points} are expiring soon! Visit {outlet} before month-end to redeem them.',
    sampleVariables: '{name}=Vikram, {points}=450, {outlet}=Indiranagar',
    isApproved: true,
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'tmpl-07',
    brandId: 'brand-01',
    name: 'Chef Winter Tasting Menu Email',
    channel: 'EMAIL',
    category: 'PROMOTIONAL',
    header: 'Introducing Our Royal Winter Flavors 🍲',
    content: 'Dear {name}, Executive Chef Sanjeev invites you to savor 8 new authentic delicacies launched exclusively at {outlet}. Enjoy a complimentary signature mocktail when you reserve a table this week using coupon {coupon}.',
    footer: 'RestoDesk Culinary Experiences • Indiranagar Flagship',
    sampleVariables: '{name}=Ananya, {outlet}=Indiranagar, {coupon}=CHEFWINTER',
    isApproved: true,
    createdAt: '2026-10-01T10:00:00.000Z',
  },
];

// ----------------------------------------------------
// SEED DATA: CAMPAIGNS
// ----------------------------------------------------
export let MOCK_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'cmp-01',
    brandId: 'brand-01',
    name: 'Diwali Festive Weekend WhatsApp Blast',
    channel: 'WHATSAPP',
    segmentId: 'seg-01',
    segmentName: 'All Registered Customers',
    templateId: 'tmpl-01',
    templateName: 'Weekend Feast 20% WhatsApp',
    couponId: 'coup-02',
    couponCode: 'WEEKEND20',
    scheduledAt: '2026-10-24T18:00:00.000Z',
    status: 'COMPLETED',
    totalRecipients: 420,
    sentCount: 420,
    deliveredCount: 412,
    readCount: 385,
    failedCount: 8,
    convertedCount: 94,
    revenueAttributed: 84600.0,
    costIncurred: 840.0,
    createdAt: '2026-10-24T12:00:00.000Z',
    updatedAt: '2026-10-25T23:59:00.000Z',
  },
  {
    id: 'cmp-02',
    brandId: 'brand-01',
    name: 'VIP Platinum Exclusive Wine & Dine',
    channel: 'WHATSAPP',
    segmentId: 'seg-04',
    segmentName: 'VIP Guests (High LTV)',
    templateId: 'tmpl-01',
    templateName: 'Weekend Feast 20% WhatsApp',
    couponId: 'coup-03',
    couponCode: 'VIP25',
    scheduledAt: '2026-10-26T17:00:00.000Z',
    status: 'COMPLETED',
    totalRecipients: 65,
    sentCount: 65,
    deliveredCount: 65,
    readCount: 62,
    failedCount: 0,
    convertedCount: 28,
    revenueAttributed: 42000.0,
    costIncurred: 130.0,
    createdAt: '2026-10-26T10:00:00.000Z',
    updatedAt: '2026-10-27T23:00:00.000Z',
  },
  {
    id: 'cmp-03',
    brandId: 'brand-01',
    name: 'Lapsed Guests Reactivation Drive (30+ Days)',
    channel: 'SMS',
    segmentId: 'seg-05',
    segmentName: 'Lapsed Guests (30-60 Days)',
    templateId: 'tmpl-04',
    templateName: 'Win-Back Lapsed Diner SMS',
    couponId: 'coup-01',
    couponCode: 'FLAT150',
    scheduledAt: '2026-10-30T19:00:00.000Z',
    status: 'SCHEDULED',
    totalRecipients: 185,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    failedCount: 0,
    convertedCount: 0,
    revenueAttributed: 0.0,
    costIncurred: 185.0,
    createdAt: '2026-10-28T09:00:00.000Z',
    updatedAt: '2026-10-28T09:00:00.000Z',
  },
  {
    id: 'cmp-04',
    brandId: 'brand-01',
    name: 'Chef Winter Tasting Menu Release',
    channel: 'EMAIL',
    segmentId: 'seg-02',
    segmentName: 'Loyal Diners (5+ Visits)',
    templateId: 'tmpl-07',
    templateName: 'Chef Winter Tasting Menu Email',
    couponId: 'coup-02',
    couponCode: 'CHEFMOCKTAIL',
    scheduledAt: '2026-10-20T11:00:00.000Z',
    status: 'COMPLETED',
    totalRecipients: 310,
    sentCount: 310,
    deliveredCount: 302,
    readCount: 198,
    failedCount: 8,
    convertedCount: 45,
    revenueAttributed: 56250.0,
    costIncurred: 155.0,
    createdAt: '2026-10-19T14:00:00.000Z',
    updatedAt: '2026-10-21T20:00:00.000Z',
  },
];

// ----------------------------------------------------
// SEED DATA: CAMPAIGN RECIPIENTS LOG
// ----------------------------------------------------
export let MOCK_CAMPAIGN_RECIPIENTS: CampaignRecipientItem[] = [
  {
    id: 'rcp-01',
    campaignId: 'cmp-01',
    customerId: 'cust-01',
    customerName: 'Rahul Sharma',
    phone: '+919876543210',
    email: 'rahul.sharma@example.com',
    status: 'READ',
    sentAt: '2026-10-24T18:00:05.000Z',
    deliveredAt: '2026-10-24T18:00:15.000Z',
    readAt: '2026-10-24T18:14:20.000Z',
  },
  {
    id: 'rcp-02',
    campaignId: 'cmp-01',
    customerId: 'cust-02',
    customerName: 'Priya Patel',
    phone: '+919876543211',
    email: 'priya.patel@example.com',
    status: 'READ',
    sentAt: '2026-10-24T18:00:05.000Z',
    deliveredAt: '2026-10-24T18:00:18.000Z',
    readAt: '2026-10-24T18:08:45.000Z',
  },
  {
    id: 'rcp-03',
    campaignId: 'cmp-01',
    customerId: 'cust-03',
    customerName: 'Amit Verma',
    phone: '+919876543212',
    email: 'amit.verma@example.com',
    status: 'DELIVERED',
    sentAt: '2026-10-24T18:00:05.000Z',
    deliveredAt: '2026-10-24T18:00:22.000Z',
  },
  {
    id: 'rcp-04',
    campaignId: 'cmp-01',
    customerId: 'cust-04',
    customerName: 'Sneha Reddy',
    phone: '+919876543213',
    status: 'READ',
    sentAt: '2026-10-24T18:00:05.000Z',
    deliveredAt: '2026-10-24T18:00:14.000Z',
    readAt: '2026-10-24T19:20:10.000Z',
  },
  {
    id: 'rcp-05',
    campaignId: 'cmp-01',
    customerId: 'cust-05',
    customerName: 'Vikram Singh',
    phone: '+919876543214',
    status: 'FAILED',
    errorDetails: 'DND Active / User Opted Out',
    sentAt: '2026-10-24T18:00:05.000Z',
  },
  {
    id: 'rcp-06',
    campaignId: 'cmp-02',
    customerId: 'cust-01',
    customerName: 'Rahul Sharma (VIP)',
    phone: '+919876543210',
    status: 'READ',
    sentAt: '2026-10-26T17:00:02.000Z',
    deliveredAt: '2026-10-26T17:00:10.000Z',
    readAt: '2026-10-26T17:02:40.000Z',
  },
];

// ----------------------------------------------------
// SEED DATA: AUTOMATED JOURNEYS
// ----------------------------------------------------
export let MOCK_JOURNEYS: JourneyItem[] = [
  {
    id: 'jrn-01',
    brandId: 'brand-01',
    name: 'New Guest Welcome Flow',
    triggerType: 'WELCOME',
    description: 'Triggered instantly when a new guest phone number is registered at POS or Online.',
    isActive: true,
    totalTriggered: 312,
    conversions: 84,
    revenueAttributed: 72400.0,
    steps: [
      {
        id: 'jstp-01',
        journeyId: 'jrn-01',
        stepOrder: 1,
        delayHours: 0, // Instant
        channel: 'WHATSAPP',
        templateId: 'tmpl-03',
        templateName: 'Welcome Sign-Up Voucher SMS',
        templateContent: 'Welcome to RestoDesk, {name}! Enjoy flat Rs.150 OFF on your first dining or takeaway bill with code {coupon}. T&C apply.',
      },
    ],
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'jrn-02',
    brandId: 'brand-01',
    name: 'Birthday Royal Feast Greeting',
    triggerType: 'BIRTHDAY',
    description: 'Triggered 48 hours before guest\'s recorded birthday with a complimentary dessert and party discount.',
    isActive: true,
    totalTriggered: 142,
    conversions: 52,
    revenueAttributed: 98600.0,
    steps: [
      {
        id: 'jstp-02',
        journeyId: 'jrn-02',
        stepOrder: 1,
        delayHours: 0,
        channel: 'WHATSAPP',
        templateId: 'tmpl-02',
        templateName: 'Birthday Royal Celebration WhatsApp',
        templateContent: 'Dear {name}, wishing you a joyful Birthday! Celebrate your day with a complimentary Chef\'s Special Dessert and Rs.300 OFF on your party bill at {outlet} using code {coupon}. We look forward to hosting you!',
      },
    ],
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'jrn-03',
    brandId: 'brand-01',
    name: 'Anniversary Romantic Dinner Invite',
    triggerType: 'ANNIVERSARY',
    description: 'Triggered 24 hours prior to wedding anniversary with a couple dining discount.',
    isActive: true,
    totalTriggered: 88,
    conversions: 31,
    revenueAttributed: 58900.0,
    steps: [
      {
        id: 'jstp-03',
        journeyId: 'jrn-03',
        stepOrder: 1,
        delayHours: 0,
        channel: 'WHATSAPP',
        templateContent: 'Happy Anniversary {name}! 🥂 Celebrate your milestone at {outlet} with 15% OFF your special dinner. Use code {coupon} when booking.',
      },
    ],
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'jrn-04',
    brandId: 'brand-01',
    name: 'Post-Visit Dining Feedback & NPS',
    triggerType: 'POST_VISIT',
    description: 'Triggered 1 hour after bill settlement with link to quick 30-sec feedback form.',
    isActive: true,
    totalTriggered: 1240,
    conversions: 468, // Feedbacks collected
    revenueAttributed: 0.0,
    steps: [
      {
        id: 'jstp-04',
        journeyId: 'jrn-04',
        stepOrder: 1,
        delayHours: 1,
        channel: 'WHATSAPP',
        templateId: 'tmpl-05',
        templateName: 'Post-Visit Dining Feedback WhatsApp',
        templateContent: 'Hi {name}, thank you for dining with us today at {outlet}! We would love to know how your food and service were. Tap the link to rate your experience: {review_link}',
      },
    ],
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'jrn-05',
    brandId: 'brand-01',
    name: 'Win-Back Lapsed Diners (45 Days)',
    triggerType: 'WIN_BACK',
    description: 'Triggered automatically when a previously active guest has not visited for 45 days.',
    isActive: true,
    totalTriggered: 245,
    conversions: 48,
    revenueAttributed: 52800.0,
    steps: [
      {
        id: 'jstp-05',
        journeyId: 'jrn-05',
        stepOrder: 1,
        delayHours: 0,
        channel: 'SMS',
        templateId: 'tmpl-04',
        templateName: 'Win-Back Lapsed Diner SMS',
        templateContent: 'We miss you at {outlet}, {name}! Craving your favorites? Visit us this week & get 15% OFF with code {coupon}. Valid for 7 days.',
      },
    ],
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'jrn-06',
    brandId: 'brand-01',
    name: 'Quarterly Points Expiry Reminder',
    triggerType: 'POINTS_EXPIRY',
    description: 'Triggered 7 days before unredeemed reward points lapse at the end of the quarter.',
    isActive: false,
    totalTriggered: 110,
    conversions: 34,
    revenueAttributed: 39100.0,
    steps: [
      {
        id: 'jstp-06',
        journeyId: 'jrn-06',
        stepOrder: 1,
        delayHours: 0,
        channel: 'SMS',
        templateId: 'tmpl-06',
        templateName: 'Points Expiry Alert SMS',
        templateContent: 'Alert: Your {points} RestoDesk reward points worth Rs.{points} are expiring soon! Visit {outlet} before month-end to redeem them.',
      },
    ],
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

// ----------------------------------------------------
// SEED DATA: FEEDBACK FORM & QUESTIONS
// ----------------------------------------------------
export let MOCK_FEEDBACK_FORM: FeedbackFormItem = {
  id: 'form-01',
  brandId: 'brand-01',
  outletId: 'outlet-01',
  title: 'Guest Dining Experience & Satisfaction',
  description: 'Thank you for dining with RestoDesk. Your ratings help us continuously elevate our food, hospitality, and ambiance.',
  isActive: true,
  googleReviewUrl: 'https://g.page/r/restodesk-indiranagar/review',
  questions: [
    {
      id: 'q-01',
      feedbackFormId: 'form-01',
      questionText: 'How would you rate the taste, freshness, and presentation of the food?',
      questionType: 'STAR_RATING',
      categoryKey: 'food',
      isRequired: true,
      sortOrder: 1,
    },
    {
      id: 'q-02',
      feedbackFormId: 'form-01',
      questionText: 'How was the speed and attentiveness of our service staff?',
      questionType: 'STAR_RATING',
      categoryKey: 'service',
      isRequired: true,
      sortOrder: 2,
    },
    {
      id: 'q-03',
      feedbackFormId: 'form-01',
      questionText: 'How would you rate our dining ambiance, music, and restaurant cleanliness?',
      questionType: 'STAR_RATING',
      categoryKey: 'ambiance',
      isRequired: true,
      sortOrder: 3,
    },
    {
      id: 'q-04',
      feedbackFormId: 'form-01',
      questionText: 'On a scale from 0 to 10, how likely are you to recommend RestoDesk to friends & family? (NPS)',
      questionType: 'NPS_SCALE',
      categoryKey: 'nps',
      isRequired: true,
      sortOrder: 4,
    },
    {
      id: 'q-05',
      feedbackFormId: 'form-01',
      questionText: 'Any special compliments for our chef or suggestions to make your next visit even better?',
      questionType: 'TEXT',
      categoryKey: 'comment',
      isRequired: false,
      sortOrder: 5,
    },
  ],
};

// ----------------------------------------------------
// SEED DATA: FEEDBACK RESPONSES
// ----------------------------------------------------
export let MOCK_FEEDBACK_RESPONSES: FeedbackResponseItem[] = [
  {
    id: 'fb-01',
    feedbackFormId: 'form-01',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    customerId: 'cust-01',
    customerName: 'Rahul Sharma',
    customerPhone: '+919876543210',
    orderId: 'ord-101',
    billNumber: 'INV-20261028-001',
    tableNumber: 'T-04',
    overallRating: 5.0,
    foodRating: 5.0,
    serviceRating: 5.0,
    ambianceRating: 5.0,
    npsScore: 10,
    npsCategory: 'PROMOTER',
    comments: 'Exceptional Dal Makhani and Butter Naan! Wait staff was incredibly attentive and polite. Will definitely return with colleagues.',
    isResolved: true,
    redirectedToGoogle: true,
    createdAt: '2026-10-28T14:35:00.000Z',
  },
  {
    id: 'fb-02',
    feedbackFormId: 'form-01',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    customerId: 'cust-02',
    customerName: 'Priya Patel',
    customerPhone: '+919876543211',
    orderId: 'ord-102',
    billNumber: 'INV-20261028-002',
    tableNumber: 'T-07',
    overallRating: 5.0,
    foodRating: 5.0,
    serviceRating: 5.0,
    ambianceRating: 4.0,
    npsScore: 10,
    npsCategory: 'PROMOTER',
    comments: 'Paneer Tikka was smoky and melt-in-mouth. Fast billing with UPI QR on bill slip. Great experience!',
    isResolved: true,
    redirectedToGoogle: true,
    createdAt: '2026-10-28T15:10:00.000Z',
  },
  {
    id: 'fb-03',
    feedbackFormId: 'form-01',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    customerId: 'cust-03',
    customerName: 'Amit Verma',
    customerPhone: '+919876543212',
    orderId: 'ord-103',
    billNumber: 'INV-20261028-003',
    tableNumber: 'T-02',
    overallRating: 4.0,
    foodRating: 4.5,
    serviceRating: 3.5,
    ambianceRating: 4.0,
    npsScore: 8,
    npsCategory: 'PASSIVE',
    comments: 'Food was top notch as always, but food took around 25 minutes to arrive due to weekend dinner rush.',
    isResolved: true,
    redirectedToGoogle: false,
    createdAt: '2026-10-28T16:20:00.000Z',
  },
  {
    id: 'fb-04',
    feedbackFormId: 'form-01',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    customerId: 'cust-04',
    customerName: 'Sneha Reddy',
    customerPhone: '+919876543213',
    orderId: 'ord-104',
    billNumber: 'INV-20261028-004',
    tableNumber: 'T-09',
    overallRating: 2.0, // Critical Low-Rating Alert
    foodRating: 2.0,
    serviceRating: 2.0,
    ambianceRating: 3.0,
    npsScore: 3,
    npsCategory: 'DETRACTOR',
    comments: 'Soup was served lukewarm and our drinks were forgotten until we reminded the captain twice. Very disappointed with dinner service.',
    isResolved: false, // Pending Manager Resolution
    resolutionNotes: undefined,
    redirectedToGoogle: false,
    createdAt: '2026-10-28T20:45:00.000Z',
  },
  {
    id: 'fb-05',
    feedbackFormId: 'form-01',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    customerId: 'cust-05',
    customerName: 'Vikram Singh',
    customerPhone: '+919876543214',
    orderId: 'ord-105',
    billNumber: 'INV-20261028-005',
    tableNumber: 'T-12',
    overallRating: 5.0,
    foodRating: 5.0,
    serviceRating: 5.0,
    ambianceRating: 5.0,
    npsScore: 10,
    npsCategory: 'PROMOTER',
    comments: 'The Hyderabadi Chicken Biryani was aromatic and portion size was generous. Loved the mango lassi too!',
    isResolved: true,
    redirectedToGoogle: true,
    createdAt: '2026-10-28T21:15:00.000Z',
  },
  {
    id: 'fb-06',
    feedbackFormId: 'form-01',
    outletId: 'outlet-02',
    outletName: 'Koramangala Dine-In',
    customerId: 'cust-06',
    customerName: 'Ananya Deshmukh',
    customerPhone: '+919876543215',
    overallRating: 4.5,
    foodRating: 5.0,
    serviceRating: 4.0,
    ambianceRating: 4.5,
    npsScore: 9,
    npsCategory: 'PROMOTER',
    comments: 'Cozy rooftop vibes and courteous team. Gulab Jamun with Rabri was the highlight of the night.',
    isResolved: true,
    redirectedToGoogle: true,
    createdAt: '2026-10-27T19:30:00.000Z',
  },
  {
    id: 'fb-07',
    feedbackFormId: 'form-01',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    customerName: 'Rajesh Iyer',
    customerPhone: '+919876543218',
    overallRating: 3.0,
    foodRating: 3.0,
    serviceRating: 3.0,
    ambianceRating: 4.0,
    npsScore: 6,
    npsCategory: 'DETRACTOR',
    comments: 'Mutton was a bit chewy and salty. AC in the corner table was blowing directly on us.',
    isResolved: true,
    resolutionNotes: 'General Manager Ramesh Patel called Mr. Rajesh on phone, apologized, and credited 250 points + a complimentary dessert voucher for next visit.',
    resolvedBy: 'Ramesh Patel (Manager)',
    resolvedAt: '2026-10-28T11:00:00.000Z',
    redirectedToGoogle: false,
    createdAt: '2026-10-27T22:10:00.000Z',
  },
];

// ----------------------------------------------------
// PHASE 7 HELPER METHODS & SIMULATORS
// ----------------------------------------------------

export function getCampaigns(channel?: string, status?: string): CampaignItem[] {
  let list = [...MOCK_CAMPAIGNS];
  if (channel && channel !== 'ALL') {
    list = list.filter((c) => c.channel === channel);
  }
  if (status && status !== 'ALL') {
    list = list.filter((c) => c.status === status);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createCampaign(data: Partial<CampaignItem>): CampaignItem {
  const newCmp: CampaignItem = {
    id: `cmp-${Date.now().toString(36)}`,
    brandId: 'brand-01',
    name: data.name || 'Untitled Campaign',
    channel: data.channel || 'WHATSAPP',
    segmentId: data.segmentId,
    segmentName: data.segmentName || 'Custom Audience',
    templateId: data.templateId,
    templateName: data.templateName,
    couponId: data.couponId,
    couponCode: data.couponCode,
    scheduledAt: data.scheduledAt,
    status: data.status || 'COMPLETED',
    totalRecipients: data.totalRecipients || 150,
    sentCount: data.status === 'SCHEDULED' ? 0 : (data.totalRecipients || 150),
    deliveredCount: data.status === 'SCHEDULED' ? 0 : Math.round((data.totalRecipients || 150) * 0.98),
    readCount: data.status === 'SCHEDULED' ? 0 : Math.round((data.totalRecipients || 150) * 0.88),
    failedCount: data.status === 'SCHEDULED' ? 0 : Math.round((data.totalRecipients || 150) * 0.02),
    convertedCount: data.status === 'SCHEDULED' ? 0 : Math.round((data.totalRecipients || 150) * 0.22),
    revenueAttributed: data.status === 'SCHEDULED' ? 0 : Math.round((data.totalRecipients || 150) * 0.22 * 850),
    costIncurred: (data.totalRecipients || 150) * (data.channel === 'WHATSAPP' ? 2 : data.channel === 'SMS' ? 1 : 0.5),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MOCK_CAMPAIGNS.unshift(newCmp);
  return newCmp;
}

export function cancelCampaign(id: string): CampaignItem | null {
  const index = MOCK_CAMPAIGNS.findIndex((c) => c.id === id);
  if (index === -1) return null;
  MOCK_CAMPAIGNS[index].status = 'CANCELLED';
  MOCK_CAMPAIGNS[index].updatedAt = new Date().toISOString();
  return MOCK_CAMPAIGNS[index];
}

export function getMessageTemplates(channel?: string): MessageTemplateItem[] {
  if (channel && channel !== 'ALL') {
    return MOCK_MESSAGE_TEMPLATES.filter((t) => t.channel === channel);
  }
  return MOCK_MESSAGE_TEMPLATES;
}

export function createMessageTemplate(data: Partial<MessageTemplateItem>): MessageTemplateItem {
  const newTmpl: MessageTemplateItem = {
    id: `tmpl-${Date.now().toString(36)}`,
    brandId: 'brand-01',
    name: data.name || 'Custom Template',
    channel: data.channel || 'WHATSAPP',
    category: data.category || 'PROMOTIONAL',
    header: data.header,
    content: data.content || '',
    footer: data.footer,
    sampleVariables: data.sampleVariables,
    isApproved: true,
    createdAt: new Date().toISOString(),
  };

  MOCK_MESSAGE_TEMPLATES.unshift(newTmpl);
  return newTmpl;
}

export function getJourneys(): JourneyItem[] {
  return MOCK_JOURNEYS;
}

export function toggleJourney(id: string): JourneyItem | null {
  const item = MOCK_JOURNEYS.find((j) => j.id === id);
  if (!item) return null;
  item.isActive = !item.isActive;
  return item;
}

export function getFeedbackResponses(outletId?: string, ratingFilter?: number, unresolvedOnly?: boolean): FeedbackResponseItem[] {
  let list = [...MOCK_FEEDBACK_RESPONSES];
  if (outletId && outletId !== 'all') {
    list = list.filter((f) => f.outletId === outletId);
  }
  if (ratingFilter) {
    list = list.filter((f) => Math.floor(f.overallRating) === ratingFilter);
  }
  if (unresolvedOnly) {
    list = list.filter((f) => !f.isResolved);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getFeedbackMetrics() {
  const total = MOCK_FEEDBACK_RESPONSES.length;
  if (total === 0) {
    return {
      averageRating: 0,
      totalResponses: 0,
      npsScore: 0,
      promotersCount: 0,
      passivesCount: 0,
      detractorsCount: 0,
      unresolvedAlerts: 0,
      avgFood: 0,
      avgService: 0,
      avgAmbiance: 0,
      googleRedirects: 0,
    };
  }

  const sumRating = MOCK_FEEDBACK_RESPONSES.reduce((acc, f) => acc + f.overallRating, 0);
  const sumFood = MOCK_FEEDBACK_RESPONSES.reduce((acc, f) => acc + f.foodRating, 0);
  const sumService = MOCK_FEEDBACK_RESPONSES.reduce((acc, f) => acc + f.serviceRating, 0);
  const sumAmbiance = MOCK_FEEDBACK_RESPONSES.reduce((acc, f) => acc + f.ambianceRating, 0);

  const promoters = MOCK_FEEDBACK_RESPONSES.filter((f) => f.npsCategory === 'PROMOTER').length;
  const passives = MOCK_FEEDBACK_RESPONSES.filter((f) => f.npsCategory === 'PASSIVE').length;
  const detractors = MOCK_FEEDBACK_RESPONSES.filter((f) => f.npsCategory === 'DETRACTOR').length;
  const unresolved = MOCK_FEEDBACK_RESPONSES.filter((f) => !f.isResolved).length;
  const googleRedirects = MOCK_FEEDBACK_RESPONSES.filter((f) => f.redirectedToGoogle).length;

  // NPS = % Promoters - % Detractors
  const npsScore = Math.round(((promoters - detractors) / total) * 100);

  return {
    averageRating: Number((sumRating / total).toFixed(1)),
    totalResponses: total,
    npsScore,
    promotersCount: promoters,
    passivesCount: passives,
    detractorsCount: detractors,
    unresolvedAlerts: unresolved,
    avgFood: Number((sumFood / total).toFixed(1)),
    avgService: Number((sumService / total).toFixed(1)),
    avgAmbiance: Number((sumAmbiance / total).toFixed(1)),
    googleRedirects,
  };
}

export function submitFeedback(data: {
  outletId: string;
  customerName: string;
  customerPhone: string;
  overallRating: number;
  foodRating: number;
  serviceRating: number;
  ambianceRating: number;
  npsScore: number;
  comments?: string;
  tableNumber?: string;
  billNumber?: string;
  redirectedToGoogle?: boolean;
}): FeedbackResponseItem {
  let npsCategory: 'PROMOTER' | 'PASSIVE' | 'DETRACTOR' = 'PASSIVE';
  if (data.npsScore >= 9) npsCategory = 'PROMOTER';
  else if (data.npsScore <= 6) npsCategory = 'DETRACTOR';

  const newResponse: FeedbackResponseItem = {
    id: `fb-${Date.now().toString(36)}`,
    feedbackFormId: 'form-01',
    outletId: data.outletId,
    outletName: data.outletId === 'outlet-02' ? 'Koramangala Dine-In' : 'Indiranagar Flagship',
    customerName: data.customerName || 'Anonymous Guest',
    customerPhone: data.customerPhone || '',
    tableNumber: data.tableNumber,
    billNumber: data.billNumber,
    overallRating: data.overallRating,
    foodRating: data.foodRating,
    serviceRating: data.serviceRating,
    ambianceRating: data.ambianceRating,
    npsScore: data.npsScore,
    npsCategory,
    comments: data.comments,
    isResolved: data.overallRating >= 3.5, // Auto-marked resolved if 4+ stars; requires manager resolution if < 3.5
    redirectedToGoogle: Boolean(data.redirectedToGoogle),
    createdAt: new Date().toISOString(),
  };

  MOCK_FEEDBACK_RESPONSES.unshift(newResponse);
  return newResponse;
}

export function resolveFeedback(id: string, notes: string, resolvedBy: string): FeedbackResponseItem | null {
  const item = MOCK_FEEDBACK_RESPONSES.find((f) => f.id === id);
  if (!item) return null;
  item.isResolved = true;
  item.resolutionNotes = notes;
  item.resolvedBy = resolvedBy;
  item.resolvedAt = new Date().toISOString();
  return item;
}

// ============================================================================
// PHASE 8: ONLINE ORDERING, QR MENU, AGGREGATORS & DELIVERY FLEET
// ============================================================================

export type OnlineOrderChannel = 'DIRECT_WEB' | 'ZOMATO' | 'SWIGGY' | 'QR_TABLE';
export type OnlineOrderStatus = 'NEW' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type DeliveryBoyStatusType = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export interface OnlineOrderItem {
  itemId: string;
  itemName: string;
  qty: number;
  price: number;
  variant?: string;
  addOns?: string[];
}

export interface OnlineOrderRecord {
  id: string;
  orderNumber: string;
  outletId: string;
  outletName: string;
  channel: OnlineOrderChannel;
  orderType: 'DELIVERY' | 'TAKEAWAY' | 'DINE_IN';
  status: OnlineOrderStatus;
  aggregatorOrderId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  deliveryZoneId?: string;
  deliveryBoyId?: string;
  deliveryBoyName?: string;
  deliveryBoyPhone?: string;
  items: OnlineOrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  packagingFee: number;
  discount: number;
  total: number;
  paymentMethod: 'ONLINE_PREPAID' | 'CASH_ON_DELIVERY' | 'UPI_QR';
  paymentStatus: 'PAID' | 'PENDING';
  prepTimeMinutes?: number;
  kitchenNotes?: string;
  tableId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryBoyRecord {
  id: string;
  outletId: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: 'BIKE' | 'SCOOTER' | 'EV';
  status: DeliveryBoyStatusType;
  activeOrdersCount: number;
  totalDeliveredToday: number;
  rating: number;
  joinedAt: string;
}

export interface DeliveryZoneRecord {
  id: string;
  outletId: string;
  name: string;
  minOrderAmount: number;
  deliveryFee: number;
  estimatedMinutes: number;
  coverageRadiusKm: number;
  isActive: boolean;
}

export interface TableServiceRequestRecord {
  id: string;
  outletId: string;
  tableId: string;
  tableName: string;
  requestType: 'CALL_WAITER' | 'REQUEST_BILL' | 'WATER_REFILL' | 'CLEAN_TABLE';
  status: 'PENDING' | 'ACKNOWLEDGED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
}

// ----------------------------------------------------
// SEED DATA: DELIVERY BOYS
// ----------------------------------------------------
export let MOCK_DELIVERY_BOYS: DeliveryBoyRecord[] = [
  {
    id: 'db-01',
    outletId: 'outlet-01',
    name: 'Deepak Kumar',
    phone: '+919876543220',
    vehicleNumber: 'KA-04-ER-2104',
    vehicleType: 'SCOOTER',
    status: 'AVAILABLE',
    activeOrdersCount: 0,
    totalDeliveredToday: 14,
    rating: 4.9,
    joinedAt: '2025-06-15',
  },
  {
    id: 'db-02',
    outletId: 'outlet-01',
    name: 'Rajesh G',
    phone: '+919876543221',
    vehicleNumber: 'KA-01-MJ-8821',
    vehicleType: 'BIKE',
    status: 'BUSY',
    activeOrdersCount: 1,
    totalDeliveredToday: 18,
    rating: 4.8,
    joinedAt: '2025-04-10',
  },
  {
    id: 'db-03',
    outletId: 'outlet-01',
    name: 'Suraj Yadav',
    phone: '+919876543222',
    vehicleNumber: 'KA-03-EQ-4491',
    vehicleType: 'EV',
    status: 'AVAILABLE',
    activeOrdersCount: 0,
    totalDeliveredToday: 11,
    rating: 4.7,
    joinedAt: '2026-01-20',
  },
  {
    id: 'db-04',
    outletId: 'outlet-01',
    name: 'Vinod Nair',
    phone: '+919876543223',
    vehicleNumber: 'KA-05-HL-1930',
    vehicleType: 'BIKE',
    status: 'OFFLINE',
    activeOrdersCount: 0,
    totalDeliveredToday: 6,
    rating: 4.6,
    joinedAt: '2025-11-01',
  },
];

// ----------------------------------------------------
// SEED DATA: DELIVERY ZONES
// ----------------------------------------------------
export let MOCK_DELIVERY_ZONES: DeliveryZoneRecord[] = [
  {
    id: 'zone-01',
    outletId: 'outlet-01',
    name: 'Indiranagar & Domlur (0-3 km)',
    minOrderAmount: 200.0,
    deliveryFee: 30.0,
    estimatedMinutes: 30,
    coverageRadiusKm: 3.0,
    isActive: true,
  },
  {
    id: 'zone-02',
    outletId: 'outlet-01',
    name: 'Koramangala & HAL (3-6 km)',
    minOrderAmount: 350.0,
    deliveryFee: 50.0,
    estimatedMinutes: 45,
    coverageRadiusKm: 6.0,
    isActive: true,
  },
  {
    id: 'zone-03',
    outletId: 'outlet-01',
    name: 'HSR Layout & MG Road (6-10 km)',
    minOrderAmount: 500.0,
    deliveryFee: 80.0,
    estimatedMinutes: 55,
    coverageRadiusKm: 10.0,
    isActive: true,
  },
];

// ----------------------------------------------------
// SEED DATA: ONLINE & AGGREGATOR ORDERS
// ----------------------------------------------------
export let MOCK_ONLINE_ORDERS: OnlineOrderRecord[] = [
  {
    id: 'onl-101',
    orderNumber: 'ONL-20261028-101',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    channel: 'ZOMATO',
    orderType: 'DELIVERY',
    status: 'NEW', // Needs Accept/Reject action
    aggregatorOrderId: 'ZOM-884920',
    customerName: 'Aditya Kashyap',
    customerPhone: '+919876543231',
    deliveryAddress: 'Flat 402, Sunshine Apts, 12th Main Indiranagar, Bangalore',
    deliveryZoneId: 'zone-01',
    items: [
      { itemId: 'item-01', itemName: 'Butter Chicken Old Delhi Style', qty: 1, price: 420.0, variant: 'Regular' },
      { itemId: 'item-05', itemName: 'Garlic Butter Naan', qty: 3, price: 85.0 },
      { itemId: 'item-08', itemName: 'Special Mango Lassi', qty: 2, price: 180.0 },
    ],
    subtotal: 1035.0,
    tax: 51.75,
    deliveryFee: 0.0, // Borne by Zomato
    packagingFee: 35.0,
    discount: 100.0,
    total: 1021.75,
    paymentMethod: 'ONLINE_PREPAID',
    paymentStatus: 'PAID',
    prepTimeMinutes: 25,
    kitchenNotes: 'Medium spicy, extra mint chutney for delivery',
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 mins ago
    updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: 'onl-102',
    orderNumber: 'ONL-20261028-102',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    channel: 'SWIGGY',
    orderType: 'DELIVERY',
    status: 'PREPARING',
    aggregatorOrderId: 'SWG-449102',
    customerName: 'Meera Nambiar',
    customerPhone: '+919876543232',
    deliveryAddress: 'Villa 14, Prestige Ozone, Whitefield Road, Bangalore',
    deliveryZoneId: 'zone-02',
    items: [
      { itemId: 'item-02', itemName: 'Hyderabadi Chicken Dum Biryani', qty: 2, price: 380.0 },
      { itemId: 'item-04', itemName: 'Dal Makhani Special', qty: 1, price: 320.0 },
      { itemId: 'item-10', itemName: 'Gulab Jamun with Rabri', qty: 2, price: 180.0 },
    ],
    subtotal: 1440.0,
    tax: 72.0,
    deliveryFee: 0.0,
    packagingFee: 40.0,
    discount: 150.0,
    total: 1402.0,
    paymentMethod: 'ONLINE_PREPAID',
    paymentStatus: 'PAID',
    prepTimeMinutes: 20,
    kitchenNotes: 'Send separate raita for biryani',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 mins ago
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'onl-103',
    orderNumber: 'ONL-20261028-103',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    channel: 'DIRECT_WEB',
    orderType: 'DELIVERY',
    status: 'OUT_FOR_DELIVERY',
    customerName: 'Kunal Sen',
    customerPhone: '+919876543233',
    deliveryAddress: 'House 88, 5th Cross, HAL 2nd Stage, Indiranagar',
    deliveryZoneId: 'zone-01',
    deliveryBoyId: 'db-02',
    deliveryBoyName: 'Rajesh G',
    deliveryBoyPhone: '+919876543221',
    items: [
      { itemId: 'item-03', itemName: 'Paneer Tikka Angara', qty: 1, price: 340.0 },
      { itemId: 'item-04', itemName: 'Dal Makhani Special', qty: 1, price: 320.0 },
      { itemId: 'item-09', itemName: 'Tandoori Roti (Butter)', qty: 4, price: 40.0 },
    ],
    subtotal: 820.0,
    tax: 41.0,
    deliveryFee: 30.0,
    packagingFee: 25.0,
    discount: 82.0,
    total: 834.0,
    paymentMethod: 'ONLINE_PREPAID',
    paymentStatus: 'PAID',
    kitchenNotes: 'Ring bell twice, deliver to door',
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 'onl-104',
    orderNumber: 'ONL-20261028-104',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    channel: 'DIRECT_WEB',
    orderType: 'TAKEAWAY',
    status: 'READY',
    customerName: 'Divya R',
    customerPhone: '+919876543234',
    items: [
      { itemId: 'item-01', itemName: 'Butter Chicken Old Delhi Style', qty: 1, price: 420.0 },
      { itemId: 'item-05', itemName: 'Garlic Butter Naan', qty: 2, price: 85.0 },
    ],
    subtotal: 590.0,
    tax: 29.5,
    deliveryFee: 0.0,
    packagingFee: 20.0,
    discount: 59.0,
    total: 580.5,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    kitchenNotes: 'Customer will collect by car in 10 mins',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: 'onl-105',
    orderNumber: 'ONL-20261028-105',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    channel: 'QR_TABLE',
    orderType: 'DINE_IN',
    status: 'PREPARING',
    tableId: 't-04',
    customerName: 'Sanjay Dutt & Guest',
    customerPhone: '+919876543235',
    items: [
      { itemId: 'item-03', itemName: 'Paneer Tikka Angara', qty: 1, price: 340.0 },
      { itemId: 'item-08', itemName: 'Special Mango Lassi', qty: 2, price: 180.0 },
    ],
    subtotal: 700.0,
    tax: 35.0,
    deliveryFee: 0.0,
    packagingFee: 0.0,
    discount: 0.0,
    total: 735.0,
    paymentMethod: 'UPI_QR',
    paymentStatus: 'PENDING',
    kitchenNotes: 'Self-ordered via table QR',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
  },
];

// ----------------------------------------------------
// SEED DATA: TABLE SERVICE REQUESTS (CALL WAITER / BILL)
// ----------------------------------------------------
export let MOCK_TABLE_SERVICE_REQUESTS: TableServiceRequestRecord[] = [
  {
    id: 'req-01',
    outletId: 'outlet-01',
    tableId: 't-04',
    tableName: 'Table T-04',
    requestType: 'CALL_WAITER',
    status: 'PENDING',
    notes: 'Guest requested table captain for recommendations',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-02',
    outletId: 'outlet-01',
    tableId: 't-07',
    tableName: 'Table T-07',
    requestType: 'REQUEST_BILL',
    status: 'PENDING',
    notes: 'Guest requested bill with split payment',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-03',
    outletId: 'outlet-01',
    tableId: 't-02',
    tableName: 'Table T-02',
    requestType: 'WATER_REFILL',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

export let MOCK_AGGREGATOR_STATUS = {
  zomatoOnline: true,
  swiggyOnline: true,
  autoAccept: false,
  lastSyncedAt: new Date().toISOString(),
};

// ----------------------------------------------------
// PHASE 8 HELPER METHODS & STATE MUTATIONS
// ----------------------------------------------------

export function getOnlineOrders(channel?: string, status?: string, outletId?: string): OnlineOrderRecord[] {
  let list = [...MOCK_ONLINE_ORDERS];
  if (outletId && outletId !== 'all') {
    list = list.filter((o) => o.outletId === outletId);
  }
  if (channel && channel !== 'ALL') {
    list = list.filter((o) => o.channel === channel);
  }
  if (status && status !== 'ALL') {
    list = list.filter((o) => o.status === status);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function acceptOnlineOrder(id: string, prepTimeMinutes: number = 25): OnlineOrderRecord | null {
  const item = MOCK_ONLINE_ORDERS.find((o) => o.id === id);
  if (!item) return null;
  item.status = 'PREPARING';
  item.prepTimeMinutes = prepTimeMinutes;
  item.updatedAt = new Date().toISOString();
  return item;
}

export function rejectOnlineOrder(id: string, reason: string): OnlineOrderRecord | null {
  const item = MOCK_ONLINE_ORDERS.find((o) => o.id === id);
  if (!item) return null;
  item.status = 'CANCELLED';
  item.kitchenNotes = `Rejected: ${reason}`;
  item.updatedAt = new Date().toISOString();
  return item;
}

export function updateOnlineOrderStatus(id: string, status: OnlineOrderStatus): OnlineOrderRecord | null {
  const item = MOCK_ONLINE_ORDERS.find((o) => o.id === id);
  if (!item) return null;
  item.status = status;
  item.updatedAt = new Date().toISOString();
  return item;
}

export function assignDeliveryBoy(orderId: string, deliveryBoyId: string): OnlineOrderRecord | null {
  const order = MOCK_ONLINE_ORDERS.find((o) => o.id === orderId);
  if (!order) return null;
  const boy = MOCK_DELIVERY_BOYS.find((b) => b.id === deliveryBoyId) || MOCK_DELIVERY_BOYS[0];
  if (!boy) return null;

  order.deliveryBoyId = boy.id;
  order.deliveryBoyName = boy.name;
  order.deliveryBoyPhone = boy.phone;
  order.status = 'OUT_FOR_DELIVERY';
  order.updatedAt = new Date().toISOString();

  boy.status = 'BUSY';
  boy.activeOrdersCount += 1;

  return order;
}

export function getDeliveryBoys(outletId?: string, status?: string): DeliveryBoyRecord[] {
  let list = [...MOCK_DELIVERY_BOYS];
  if (outletId && outletId !== 'all') {
    list = list.filter((b) => b.outletId === outletId);
  }
  if (status && status !== 'ALL') {
    list = list.filter((b) => b.status === status);
  }
  return list;
}

export function createDeliveryBoy(data: {
  outletId: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: 'BIKE' | 'SCOOTER' | 'EV';
}): DeliveryBoyRecord {
  const newBoy: DeliveryBoyRecord = {
    id: `db-${Date.now().toString(36)}`,
    outletId: data.outletId,
    name: data.name,
    phone: data.phone,
    vehicleNumber: data.vehicleNumber,
    vehicleType: data.vehicleType,
    status: 'AVAILABLE',
    activeOrdersCount: 0,
    totalDeliveredToday: 0,
    rating: 5.0,
    joinedAt: new Date().toISOString().split('T')[0],
  };

  MOCK_DELIVERY_BOYS.unshift(newBoy);
  return newBoy;
}

export function updateDeliveryBoyStatus(id: string, status: DeliveryBoyStatusType): DeliveryBoyRecord | null {
  const boy = MOCK_DELIVERY_BOYS.find((b) => b.id === id);
  if (!boy) return null;
  boy.status = status;
  return boy;
}

export function getDeliveryZones(outletId?: string): DeliveryZoneRecord[] {
  if (outletId && outletId !== 'all') {
    return MOCK_DELIVERY_ZONES.filter((z) => z.outletId === outletId);
  }
  return MOCK_DELIVERY_ZONES;
}

export function createDeliveryZone(data: {
  outletId: string;
  name: string;
  minOrderAmount: number;
  deliveryFee: number;
  estimatedMinutes: number;
  coverageRadiusKm: number;
}): DeliveryZoneRecord {
  const newZone: DeliveryZoneRecord = {
    id: `zone-${Date.now().toString(36)}`,
    outletId: data.outletId,
    name: data.name,
    minOrderAmount: data.minOrderAmount,
    deliveryFee: data.deliveryFee,
    estimatedMinutes: data.estimatedMinutes,
    coverageRadiusKm: data.coverageRadiusKm,
    isActive: true,
  };

  MOCK_DELIVERY_ZONES.push(newZone);
  return newZone;
}

export function getTableServiceRequests(outletId?: string, status?: string): TableServiceRequestRecord[] {
  let list = [...MOCK_TABLE_SERVICE_REQUESTS];
  if (outletId && outletId !== 'all') {
    list = list.filter((r) => r.outletId === outletId);
  }
  if (status && status !== 'ALL') {
    list = list.filter((r) => r.status === status);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createTableServiceRequest(data: {
  outletId: string;
  tableId: string;
  tableName: string;
  requestType: 'CALL_WAITER' | 'REQUEST_BILL' | 'WATER_REFILL' | 'CLEAN_TABLE';
  notes?: string;
}): TableServiceRequestRecord {
  const newReq: TableServiceRequestRecord = {
    id: `req-${Date.now().toString(36)}`,
    outletId: data.outletId,
    tableId: data.tableId,
    tableName: data.tableName,
    requestType: data.requestType,
    status: 'PENDING',
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };

  MOCK_TABLE_SERVICE_REQUESTS.unshift(newReq);
  return newReq;
}

export function acknowledgeTableServiceRequest(id: string): TableServiceRequestRecord | null {
  const item = MOCK_TABLE_SERVICE_REQUESTS.find((r) => r.id === id);
  if (!item) return null;
  item.status = 'COMPLETED';
  return item;
}

export function createDirectOnlineOrder(data: {
  outletId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  orderType: 'DELIVERY' | 'TAKEAWAY' | 'DINE_IN';
  items: OnlineOrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  packagingFee: number;
  discount: number;
  total: number;
  paymentMethod: 'ONLINE_PREPAID' | 'CASH_ON_DELIVERY' | 'UPI_QR';
  kitchenNotes?: string;
  tableId?: string;
}): OnlineOrderRecord {
  const seq = Math.floor(100 + Math.random() * 900);
  const newOrder: OnlineOrderRecord = {
    id: `onl-${Date.now().toString(36)}`,
    orderNumber: `ORD-${Date.now().toString().slice(-4)}-${seq}`,
    outletId: data.outletId,
    outletName: data.outletId === 'outlet-02' ? 'Koramangala Dine-In' : 'Indiranagar Flagship',
    channel: data.tableId ? 'QR_TABLE' : 'DIRECT_WEB',
    orderType: data.orderType,
    status: 'PREPARING', // Direct orders go straight to preparing
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    deliveryAddress: data.deliveryAddress,
    items: data.items,
    subtotal: data.subtotal,
    tax: data.tax,
    deliveryFee: data.deliveryFee,
    packagingFee: data.packagingFee,
    discount: data.discount,
    total: data.total,
    paymentMethod: data.paymentMethod,
    paymentStatus: data.paymentMethod === 'ONLINE_PREPAID' ? 'PAID' : 'PENDING',
    kitchenNotes: data.kitchenNotes,
    tableId: data.tableId,
    prepTimeMinutes: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MOCK_ONLINE_ORDERS.unshift(newOrder);
  return newOrder;
}

export function toggleAggregatorStore(channel: 'ZOMATO' | 'SWIGGY', isOpen: boolean) {
  if (channel === 'ZOMATO') MOCK_AGGREGATOR_STATUS.zomatoOnline = isOpen;
  if (channel === 'SWIGGY') MOCK_AGGREGATOR_STATUS.swiggyOnline = isOpen;
  return MOCK_AGGREGATOR_STATUS;
}

export function syncAggregatorMenu(channel: 'ZOMATO' | 'SWIGGY' | 'ALL') {
  MOCK_AGGREGATOR_STATUS.lastSyncedAt = new Date().toISOString();
  return {
    success: true,
    channel,
    syncedItemsCount: MOCK_ITEMS.length,
    timestamp: MOCK_AGGREGATOR_STATUS.lastSyncedAt,
  };
}

// ============================================================================
// PHASE 9: AUDIT LOGS, STAFF & RBAC, PRINTER CONFIG & API KEYS
// ============================================================================

export interface AuditLogRecord {
  id: string;
  brandId: string;
  outletId?: string;
  outletName?: string;
  userId?: string;
  userName: string;
  userRole: string;
  action: 'VOID_BILL' | 'APPLY_DISCOUNT' | 'OPEN_CASH_DRAWER' | 'PRICE_UPDATE' | 'STOCK_ADJUST' | 'DISPATCH_RIDER' | 'LOGIN' | 'SYSTEM';
  entityType: 'Order' | 'Bill' | 'Menu' | 'Inventory' | 'CashDrawer' | 'Delivery' | 'Auth' | 'System';
  entityId?: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface StaffRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'OWNER' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN' | 'MARKETING';
  outletId: string;
  outletName: string;
  isActive: boolean;
  pinCode?: string;
  joinedAt: string;
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  permissions: string[];
  expiresAt?: string;
  lastUsedAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PrinterConfigRecord {
  outletId: string;
  outletName: string;
  paperWidth: '58mm' | '80mm';
  printBillCopies: number;
  printKotCopies: number;
  printAutoCut: boolean;
  printUpiQrOnBill: boolean;
  headerTitle: string;
  headerSubtitle?: string;
  footerMessage: string;
  fssaiNumber: string;
  gstin: string;
}

// ----------------------------------------------------
// SEED DATA: AUDIT LOGS
// ----------------------------------------------------
export let MOCK_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'aud-01',
    brandId: 'brand-01',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    userId: 'usr-02',
    userName: 'Ramesh Patel',
    userRole: 'MANAGER',
    action: 'VOID_BILL',
    entityType: 'Order',
    entityId: 'ORD-20261028-042',
    details: 'Voided unpaid dine-in ticket (₹1,480) for Table T-04. Reason: Guest flight delay departure.',
    ipAddress: '192.168.1.45',
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
  },
  {
    id: 'aud-02',
    brandId: 'brand-01',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    userId: 'usr-03',
    userName: 'Rahul Nair',
    userRole: 'CASHIER',
    action: 'OPEN_CASH_DRAWER',
    entityType: 'CashDrawer',
    details: 'Manual cash drawer kick opened without sale for cash denomination change (₹500 to ₹100s).',
    ipAddress: '192.168.1.12',
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
  },
  {
    id: 'aud-03',
    brandId: 'brand-01',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    userId: 'usr-02',
    userName: 'Ramesh Patel',
    userRole: 'MANAGER',
    action: 'APPLY_DISCOUNT',
    entityType: 'Order',
    entityId: 'ORD-20261028-038',
    details: 'Approved manager override: 15% goodwill discount (₹285) on order for anniversary table.',
    ipAddress: '192.168.1.45',
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
  },
  {
    id: 'aud-04',
    brandId: 'brand-01',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    userId: 'usr-01',
    userName: 'Vikramaditya Roy',
    userRole: 'OWNER',
    action: 'PRICE_UPDATE',
    entityType: 'Menu',
    entityId: 'itm-01',
    details: 'Updated base selling price for Paneer Tikka Angara from ₹320 to ₹340.',
    ipAddress: '103.24.120.88',
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
  },
  {
    id: 'aud-05',
    brandId: 'brand-01',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    userId: 'usr-05',
    userName: 'Chef Sanjeev',
    userRole: 'KITCHEN',
    action: 'STOCK_ADJUST',
    entityType: 'Inventory',
    entityId: 'raw-01',
    details: 'Wastage entry logged: 2.5 Liters of full-cream milk discarded due to curdle during boil test.',
    ipAddress: '192.168.1.80',
    createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
  },
  {
    id: 'aud-06',
    brandId: 'brand-01',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    userName: 'System Daemon',
    userRole: 'SYSTEM',
    action: 'SYSTEM',
    entityType: 'System',
    details: 'Supabase PostgreSQL database synchronized: 62 relational models verified.',
    ipAddress: '127.0.0.1',
    createdAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
  },
];

// ----------------------------------------------------
// SEED DATA: STAFF ROSTER
// ----------------------------------------------------
export let MOCK_STAFF: StaffRecord[] = [
  {
    id: 'stf-01',
    name: 'Vikramaditya Roy',
    email: 'owner@restodesk.com',
    phone: '+919876543210',
    role: 'OWNER',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    isActive: true,
    joinedAt: '2024-01-10',
  },
  {
    id: 'stf-02',
    name: 'Ramesh Patel',
    email: 'manager@restodesk.com',
    phone: '+919876543211',
    role: 'MANAGER',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    isActive: true,
    pinCode: '4412',
    joinedAt: '2024-03-15',
  },
  {
    id: 'stf-03',
    name: 'Rahul Nair',
    email: 'cashier@restodesk.com',
    phone: '+919876543212',
    role: 'CASHIER',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    isActive: true,
    pinCode: '1102',
    joinedAt: '2024-08-01',
  },
  {
    id: 'stf-04',
    name: 'Karthik Gowda',
    email: 'waiter@restodesk.com',
    phone: '+919876543213',
    role: 'WAITER',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    isActive: true,
    joinedAt: '2025-02-14',
  },
  {
    id: 'stf-05',
    name: 'Chef Sanjeev Kapoor',
    email: 'kitchen@restodesk.com',
    phone: '+919876543214',
    role: 'KITCHEN',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    isActive: true,
    joinedAt: '2024-02-01',
  },
  {
    id: 'stf-06',
    name: 'Pooja Hegde',
    email: 'marketing@restodesk.com',
    phone: '+919876543215',
    role: 'MARKETING',
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    isActive: true,
    joinedAt: '2025-05-18',
  },
];

// ----------------------------------------------------
// SEED DATA: API KEYS
// ----------------------------------------------------
export let MOCK_API_KEYS: ApiKeyRecord[] = [
  {
    id: 'key-01',
    name: 'Zomato Aggregator Production Hook',
    prefix: 'rd_live_zom_',
    permissions: ['orders:read', 'orders:write', 'menu:read'],
    lastUsedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'key-02',
    name: 'Swiggy UrbanPiper Bridge',
    prefix: 'rd_live_swg_',
    permissions: ['orders:read', 'orders:write', 'menu:read', 'menu:write'],
    lastUsedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'key-03',
    name: 'Tally Accounting Sync ERP',
    prefix: 'rd_live_tly_',
    permissions: ['reports:read', 'sales:read', 'tax:read'],
    lastUsedAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: '2026-05-10T00:00:00.000Z',
  },
];

// ----------------------------------------------------
// SEED DATA: PRINTER SETTINGS PER OUTLET
// ----------------------------------------------------
export let MOCK_PRINTER_CONFIGS: Record<string, PrinterConfigRecord> = {
  'outlet-01': {
    outletId: 'outlet-01',
    outletName: 'Indiranagar Flagship',
    paperWidth: '80mm',
    printBillCopies: 1,
    printKotCopies: 2,
    printAutoCut: true,
    printUpiQrOnBill: true,
    headerTitle: 'RESTODESK HOSPITALITY',
    headerSubtitle: '100ft Road, Indiranagar, Bengaluru - 560038\nPh: +91 80 4123 4567',
    footerMessage: 'Thank you for dining with us!\nScan QR below to rate your experience.',
    fssaiNumber: '11223344556677',
    gstin: '29ABCDE1234F1Z5',
  },
};

// ----------------------------------------------------
// PHASE 9 HELPER METHODS
// ----------------------------------------------------

export function getAuditLogs(action?: string, entityType?: string): AuditLogRecord[] {
  let list = [...MOCK_AUDIT_LOGS];
  if (action && action !== 'ALL') {
    list = list.filter((a) => a.action === action);
  }
  if (entityType && entityType !== 'ALL') {
    list = list.filter((a) => a.entityType === entityType);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createAuditLog(data: Partial<AuditLogRecord>): AuditLogRecord {
  const newLog: AuditLogRecord = {
    id: `aud-${Date.now().toString(36)}`,
    brandId: 'brand-01',
    outletId: data.outletId || 'outlet-01',
    outletName: 'Indiranagar Flagship',
    userName: data.userName || 'Current User',
    userRole: data.userRole || 'MANAGER',
    action: data.action || 'SYSTEM',
    entityType: data.entityType || 'Order',
    entityId: data.entityId,
    details: data.details || 'User operation performed',
    ipAddress: data.ipAddress || '192.168.1.1',
    createdAt: new Date().toISOString(),
  };

  MOCK_AUDIT_LOGS.unshift(newLog);
  return newLog;
}

export function getStaff(outletId?: string, role?: string): StaffRecord[] {
  let list = [...MOCK_STAFF];
  if (outletId && outletId !== 'all') {
    list = list.filter((s) => s.outletId === outletId);
  }
  if (role && role !== 'ALL') {
    list = list.filter((s) => s.role === role);
  }
  return list;
}

export function createStaff(data: Partial<StaffRecord>): StaffRecord {
  const newStaff: StaffRecord = {
    id: `stf-${Date.now().toString(36)}`,
    name: data.name || 'New Staff',
    email: data.email || 'staff@restodesk.com',
    phone: data.phone || '+919876543200',
    role: data.role || 'CASHIER',
    outletId: data.outletId || 'outlet-01',
    outletName: 'Indiranagar Flagship',
    isActive: true,
    pinCode: data.pinCode || '1234',
    joinedAt: new Date().toISOString().split('T')[0],
  };

  MOCK_STAFF.push(newStaff);
  return newStaff;
}

export function getApiKeys(): ApiKeyRecord[] {
  return MOCK_API_KEYS;
}

export function createApiKey(name: string, permissions: string[]): ApiKeyRecord {
  const rand = Math.random().toString(36).substring(2, 10);
  const newKey: ApiKeyRecord = {
    id: `key-${Date.now().toString(36)}`,
    name,
    prefix: `rd_live_${rand}_`,
    permissions,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  MOCK_API_KEYS.unshift(newKey);
  return newKey;
}

export function getPrinterConfig(outletId: string = 'outlet-01'): PrinterConfigRecord {
  return MOCK_PRINTER_CONFIGS[outletId] || MOCK_PRINTER_CONFIGS['outlet-01'];
}

export function updatePrinterConfig(outletId: string, data: Partial<PrinterConfigRecord>): PrinterConfigRecord {
  const current = getPrinterConfig(outletId);
  MOCK_PRINTER_CONFIGS[outletId] = {
    ...current,
    ...data,
  };
  return MOCK_PRINTER_CONFIGS[outletId];
}






