import { prisma } from "../src/db/prisma.js";
import { resetDemo } from "../src/demo/resetDemo.js";

const result = await resetDemo();
console.log(`${result.tournaments} torneos de demostración creados`);
await prisma.$disconnect();
