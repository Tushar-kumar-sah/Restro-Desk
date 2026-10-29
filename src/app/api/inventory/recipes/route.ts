import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  MOCK_RECIPES,
  MOCK_RAW_MATERIALS,
  MOCK_MENU_ITEMS,
  MockRecipe,
  MockRecipeIngredient,
} from '@/lib/mock-data';

const RecipeIngredientInputSchema = z.object({
  rawMaterialId: z.string(),
  quantity: z.number().positive(),
  unit: z.enum(['KG', 'GRAM', 'LITER', 'ML', 'PIECE', 'PACKET']),
  wastePercentage: z.number().min(0).max(100).default(0),
});

const CreateRecipeSchema = z.object({
  itemId: z.string().min(1, 'Menu item is required'),
  yieldQuantity: z.number().positive().default(1),
  instructions: z.string().optional().default(''),
  ingredients: z.array(RecipeIngredientInputSchema).min(1, 'At least one ingredient required'),
});

function calculateIngredientCost(
  rawMaterialCost: number,
  quantity: number,
  unit: string,
  wastePercentage: number
): number {
  let baseCost = 0;
  if (unit === 'GRAM' || unit === 'ML') {
    baseCost = (quantity / 1000) * rawMaterialCost;
  } else {
    baseCost = quantity * rawMaterialCost;
  }
  const wasteMultiplier = 1 + (wastePercentage || 0) / 100;
  return Math.round(baseCost * wasteMultiplier * 100) / 100;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const category = searchParams.get('category') || 'ALL';

    let recipes = [...MOCK_RECIPES];

    if (search) {
      recipes = recipes.filter(
        (r) =>
          r.itemName.toLowerCase().includes(search) ||
          r.categoryName.toLowerCase().includes(search)
      );
    }

    if (category !== 'ALL') {
      recipes = recipes.filter((r) => r.categoryName === category);
    }

    const avgFoodCostPercent =
      recipes.reduce((acc, r) => acc + r.foodCostPercentage, 0) / (recipes.length || 1);

    const highestMarginDish = [...recipes].sort(
      (a, b) => b.grossMarginPercentage - a.grossMarginPercentage
    )[0];

    const lowestMarginDish = [...recipes].sort(
      (a, b) => a.grossMarginPercentage - b.grossMarginPercentage
    )[0];

    return NextResponse.json({
      success: true,
      recipes,
      totalCount: recipes.length,
      metrics: {
        totalRecipes: recipes.length,
        avgFoodCostPercent: Math.round(avgFoodCostPercent * 10) / 10,
        highestMarginDish: highestMarginDish?.itemName || 'N/A',
        lowestMarginDish: lowestMarginDish?.itemName || 'N/A',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateRecipeSchema.parse(body);

    const menuItem = MOCK_MENU_ITEMS.find((i) => i.id === validated.itemId);
    if (!menuItem) {
      return NextResponse.json({ success: false, message: 'Menu item not found' }, { status: 404 });
    }

    // Process ingredients
    const processedIngredients: MockRecipeIngredient[] = [];
    let totalCost = 0;

    for (const ing of validated.ingredients) {
      const rm = MOCK_RAW_MATERIALS.find((m) => m.id === ing.rawMaterialId);
      if (!rm) continue;

      const ingCost = calculateIngredientCost(
        rm.costPerUnit,
        ing.quantity,
        ing.unit,
        ing.wastePercentage
      );

      totalCost += ingCost;

      processedIngredients.push({
        id: `ri-${Date.now()}-${Math.random().toString().slice(2, 5)}`,
        rawMaterialId: rm.id,
        rawMaterialName: rm.name,
        quantity: ing.quantity,
        unit: ing.unit,
        costPerUnit: rm.costPerUnit,
        ingredientCost: ingCost,
        wastePercentage: ing.wastePercentage,
      });
    }

    totalCost = Math.round(totalCost * 100) / 100;
    const foodCostPct =
      menuItem.basePrice > 0 ? Math.round((totalCost / menuItem.basePrice) * 1000) / 10 : 0;
    const grossMarginPct = Math.round((100 - foodCostPct) * 10) / 10;

    // Check if recipe already exists for this item
    const existingIndex = MOCK_RECIPES.findIndex((r) => r.itemId === menuItem.id);

    const newRecipe: MockRecipe = {
      id: existingIndex >= 0 ? MOCK_RECIPES[existingIndex].id : `rcp-${Date.now()}`,
      brandId: 'brand-restodesk-001',
      itemId: menuItem.id,
      itemName: menuItem.name,
      categoryName: menuItem.categoryName || 'Main Course',
      menuPrice: menuItem.basePrice,
      yieldQuantity: validated.yieldQuantity,
      instructions: validated.instructions,
      totalFoodCost: totalCost,
      foodCostPercentage: foodCostPct,
      grossMarginPercentage: grossMarginPct,
      ingredients: processedIngredients,
    };

    if (existingIndex >= 0) {
      MOCK_RECIPES[existingIndex] = newRecipe;
    } else {
      MOCK_RECIPES.push(newRecipe);
    }

    return NextResponse.json({
      success: true,
      message: `Recipe for "${newRecipe.itemName}" saved with ${newRecipe.foodCostPercentage}% food cost`,
      recipe: newRecipe,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
