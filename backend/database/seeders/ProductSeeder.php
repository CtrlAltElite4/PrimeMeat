<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Make the old catalogue unavailable without deleting order references.
        Product::query()->update(['stock' => 0]);
        ProductVariant::query()->update([
            'stock' => 0,
            'is_active' => false,
        ]);

        $carcass = function ($name, $category, $description) {
            Product::updateOrCreate(
                ['name' => $name],
                [
                    'grade' => null,
                    'description' => $description,
                    'price' => null,
                    'image' => null,
                    'is_active' => true,
                    'category' => [$category],
                    'stock' => 20,
                    'status' => 'published',
                    'product_type' => Product::TYPE_CARCASS,
                ]
            );
        };

        $fixed = function ($name, $category, $description, $price) {
            Product::updateOrCreate(
                ['name' => $name],
                [
                    'grade' => null,
                    'description' => $description,
                    'price' => $price,
                    'image' => null,
                    'is_active' => true,
                    'category' => [$category],
                    'stock' => 20,
                    'status' => 'published',
                    'product_type' => Product::TYPE_FIXED_PRICE,
                ]
            );
        };

        // BEEF CARCASSES
        $carcass('Full Beef Carcass', 'Beef Carcasses',
            'A whole beef carcass supplied for bulk purchasing and sharing. Customers can select an age classification and weight range. The carcass can be processed according to available cut-sheet options.');

        $carcass('Half Beef Carcass', 'Beef Carcasses',
            'Half of a whole beef carcass, offering a practical bulk-buying option for households and sharing groups. Customers can select an age classification and weight range, with processing according to available cut-sheet options.');

        $carcass('Quarter Beef Carcass', 'Beef Carcasses',
            'A quarter portion of a beef carcass for smaller households and customers who want the value of bulk purchasing. Customers can select an age classification and weight range, with processing according to available cut-sheet options.');

        // BEEF PRODUCTS
        $fixed('Beef Tallow', 'Beef Products',
            'Rendered or prepared beef fat suitable for cooking, frying and traditional food preparation. Pack size: approximately 1 kg.', 55);

        $fixed('Marrow Bones', 'Beef Products',
            'Beef bones containing marrow, suitable for slow cooking, soups, broths and stock preparation. Pack size: 1 kg.', 65);

        $fixed('Cow Heels', 'Beef Products',
            'Cleaned beef heels prepared for traditional slow-cooked dishes. Pack size: 10 kg.', 400);

        $fixed('Beef Offal', 'Beef Products',
            'An assorted selection of beef offal, which may include tripe, liver, kidneys and other edible offal. Contents depend on availability. Pack size: 5 kg.', 180);

        $fixed('Cow Head', 'Beef Products',
            'A whole cow head supplied for traditional preparation, including skopo and other traditional meals. Cleaning and preparation options should be confirmed when ordering.', 390);

        $fixed('Beef Organ Meat', 'Beef Products',
            'A selection of edible beef organs, which may include liver, heart, kidneys, lungs and spleen, depending on availability. Pack size: 5 kg.', 250);

        $fixed('Cow Head & Heels Package', 'Beef Products',
            'A convenient combination of one cow head and 10 kg of cleaned beef heels for traditional meals.', 750);

        $fixed('Beef Boerewors', 'Beef Products',
            'Traditional beef sausage prepared with a blend of spices. Supplied in a 5 kg bulk pack.', 725);

        $fixed('Beef Mince', 'Beef Products',
            'Minced beef suitable for pasta sauces, cottage pie, meatballs, burgers and traditional home cooking. Supplied in a 5 kg bulk pack.', 725);

        $fixed('Lean Beef Mince', 'Beef Products',
            'Leaner minced beef for customers who prefer a lower-fat option. Supplied in a 5 kg bulk pack.', 825);

        $fixed('Beef Stewing Meat', 'Beef Products',
            'Beef portions prepared for slow cooking, stews and traditional meals. Supplied in a 5 kg bulk pack.', 700);

        $fixed('Beef Sausages', 'Beef Products',
            'Seasoned beef sausages suitable for grilling, frying and everyday meals. Supplied in a 5 kg bulk pack.', 750);

        $fixed('Beef Braai Steaks', 'Beef Products',
            'Selected beef steak cuts suitable for braai and grilling. Supplied in a 5 kg bulk pack, with cuts subject to availability.', 975);

        // MUTTON PRODUCTS
        $carcass('Mutton Carcass', 'Mutton Products',
            'A whole mutton carcass supplied for bulk purchasing, family use or sharing. Final pricing depends on the selected weight range and availability.');

        $fixed('Mutton Offal, Head, Organ Meat & Heels Package', 'Mutton Products',
            'A traditional mutton package combining available offal, head, organ meat and heels. Contents are subject to availability.', 650);

        $fixed('Mutton Organ Meat & Offal Package', 'Mutton Products',
            'A bulk selection of mutton organ meat and offal, which may include liver, kidneys, tripe and other available edible organs. Pack size: 5 kg.', 350);

        // LAMB PRODUCTS
        $carcass('Lamb Carcass', 'Lamb Products',
            'A whole lamb carcass suitable for family meals, celebrations and bulk purchasing. Processing is available according to the cut-sheet options. Final pricing depends on weight and availability.');

        $fixed('Lamb Offal, Head, Organ Meat & Heels Package', 'Lamb Products',
            'A traditional lamb package containing available offal, head, organ meat and heels. Exact contents depend on availability.', 600);

        $fixed('Lamb Organ Meat & Offal Package', 'Lamb Products',
            'A selection of lamb organ meat and offal for traditional dishes. May include liver, kidneys, tripe and other available edible organs. Pack size: 5 kg.', 350);
    }
}
