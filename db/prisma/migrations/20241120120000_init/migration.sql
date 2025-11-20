-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategies" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "short_code" TEXT,
    "setup_description" TEXT,
    "notes" TEXT,
    "is_active" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategy_technicals" (
    "id" SERIAL NOT NULL,
    "strategy_id" INTEGER NOT NULL,
    "indicator" TEXT NOT NULL,
    "timeframe" TEXT,
    "condition" TEXT NOT NULL,
    "display_order" INTEGER,
    "is_required" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "strategy_technicals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "strategy_id" INTEGER,
    "instrument" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "entry_datetime" TIMESTAMP(3) NOT NULL,
    "exit_datetime" TIMESTAMP(3),
    "entry_price" DOUBLE PRECISION NOT NULL,
    "exit_price" DOUBLE PRECISION,
    "position_size" DOUBLE PRECISION NOT NULL,
    "realized_pnl" DOUBLE PRECISION,
    "r_multiple" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "strategies_user_id_idx" ON "strategies"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "strategies_user_id_name_key" ON "strategies"("user_id", "name");

-- CreateIndex
CREATE INDEX "strategy_technicals_strategy_id_idx" ON "strategy_technicals"("strategy_id");

-- CreateIndex
CREATE INDEX "trades_user_id_idx" ON "trades"("user_id");

-- CreateIndex
CREATE INDEX "idx_trades_strategy" ON "trades"("strategy_id");

-- CreateIndex
CREATE INDEX "idx_trades_entry_datetime" ON "trades"("entry_datetime");

-- AddForeignKey
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_technicals" ADD CONSTRAINT "strategy_technicals_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "strategies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

