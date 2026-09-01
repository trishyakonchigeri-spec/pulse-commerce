import { NextRequest, NextResponse } from 'next/server';
import { reserveStock } from '@/lib/concurrency';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ReserveSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  sessionId: z.string().min(1),
  holdMinutes: z.number().optional().default(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ReserveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid reservation payload', details: parsed.error }, { status: 400 });
    }

    const { items, sessionId, holdMinutes } = parsed.data;

    const result = await reserveStock(items, sessionId, holdMinutes);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Unable to reserve inventory. Items may have just sold out.',
        },
        { status: 409 } // Conflict / Out of stock
      );
    }

    const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000).toISOString();

    return NextResponse.json({
      success: true,
      message: `Inventory successfully locked for ${holdMinutes} minutes.`,
      lockIds: result.lockIds,
      expiresAt,
    });
  } catch (error: any) {
    console.error('[Reserve API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
