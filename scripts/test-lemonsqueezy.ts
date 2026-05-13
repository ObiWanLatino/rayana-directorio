import {
  getProduct,
  lemonSqueezySetup,
  listVariants,
} from "@lemonsqueezy/lemonsqueezy.js";

async function main() {
  lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });

  const { data, error } = await getProduct("1049956");

  if (error) {
    console.error("❌ Error:", error);
  } else {
    console.log("✅ Producto encontrado:", data?.data?.attributes?.name);
    console.log("Variantes:", data?.data?.relationships?.variants);

    const { data: variants, error: variantsError } = await listVariants({
      filter: { productId: "1049956" },
    });

    if (variantsError) {
      console.error("❌ Error variantes:", variantsError);
    } else {
      variants?.data?.forEach((v) => {
        const a = v.attributes as typeof v.attributes & {
          price_formatted?: string;
        };
        console.log(
          `Variant ID: ${v.id} | Nombre: ${a.name} | Precio: ${a.price} | Moneda: ${a.price_formatted}`,
        );
      });
    }
  }
}

void main();
