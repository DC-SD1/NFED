import AvocadoImg from "@/assets/images/products/avocado.png";
import CassavaImg from "@/assets/images/products/cassava.png";
import ChiliPepperImg from "@/assets/images/products/chili-pepper.png";
import GingerImg from "@/assets/images/products/ginger.png";
import PineappleImg from "@/assets/images/products/pineapple.png";
import SheaImg from "@/assets/images/products/shea.png";
import SoybeanImg from "@/assets/images/products/soya-beans.png";
import SweetPotatoImg from "@/assets/images/products/sweet-potatoes.png";

export const products = [
  {
    id: "cassava",
    name: "Cassava",
    image: CassavaImg,
    category: "Roots and tubers",
    quantity: 30000,
    details: [
      {
        title: "Variety",
        value: "Bankye hemaa",
      },
      {
        title: "Incoterms",
        value: "EXW, FCA",
      },
      {
        title: "Price",
        value: "350",
      },
    ],
  },
  {
    id: "sweet-potato",
    name: "Sweet Potato",
    image: SweetPotatoImg,
    category: "Roots and tubers",
    quantity: 30000,
    details: [
      {
        title: "Variety",
        value: "Orange flesh",
      },
      {
        title: "Incoterms",
        value: "CIF, DDP",
      },
      {
        title: "Price",
        value: "300",
      },
    ],
  },
  {
    id: "ginger",
    name: "Ginger",
    image: GingerImg,
    category: "Roots and tubers",
    quantity: 30000,
    details: [
      {
        title: "Variety",
        value: "Local",
      },
      {
        title: "Incoterms",
        value: "EXW, FCA",
      },
      {
        title: "Price",
        value: "450",
      },
    ],
  },
  {
    id: "soybean",
    name: "Soybean",
    image: SoybeanImg,
    category: "Roots and tubers",
    quantity: 30000,
    details: [
      {
        title: "Variety",
        value: "White",
      },
      {
        title: "Incoterms",
        value: "CIF, DAP",
      },
      {
        title: "Price",
        value: "600",
      },
    ],
  },
  {
    id: "sheanut",
    name: "Sheanut",
    image: SheaImg,
    category: "Roots and tubers",
    quantity: 30000,
    details: [
      {
        title: "Variety",
        value: "Irish",
      },
      {
        title: "Incoterms",
        value: "FOB, CFR",
      },
      {
        title: "Price",
        value: "320",
      },
    ],
  },
  {
    id: "taro",
    name: "Taro",
    image: PineappleImg,
    category: "Roots and tubers",
    quantity: 30000,
    details: [
      {
        title: "Variety",
        value: "Bamboo",
      },
      {
        title: "Incoterms",
        value: "EXW, DDP",
      },
      {
        title: "Price",
        value: "380",
      },
    ],
  },
  {
    id: "avocado",
    name: "Avocado",
    image: AvocadoImg,
    category: "Roots and tubers",
    quantity: 30000,
    details: [
      {
        title: "Variety",
        value: "Red globe",
      },
      {
        title: "Incoterms",
        value: "FOB, CIF",
      },
      {
        title: "Price",
        value: "500",
      },
    ],
  },
  {
    id: "cassava",
    name: "Cassava",
    image: CassavaImg,
    category: "Roots and tubers",
    quantity: 30000,
    details: [
      {
        title: "Variety",
        value: "Massa",
      },
      {
        title: "Incoterms",
        value: "FOB, CFR",
      },
      {
        title: "Price",
        value: "450",
      },
    ],
  },
  {
    id: "chili-pepper",
    name: "Chili Pepper",
    image: ChiliPepperImg,
    category: "Roots and tubers",
    quantity: 30000,
    details: [
      {
        title: "Variety",
        value: "Daikon",
      },
      {
        title: "Incoterms",
        value: "EXW, FCA",
      },
      {
        title: "Price",
        value: "250",
      },
    ],
  },
];

export const cropInterests = [
  {
    label: "Selected crops",
    products: [
      {
        id: "cassava",
        name: "Cassava",
        image: CassavaImg.src,
        category: "Roots and tubers",
        quantity: 30000,
        details: [
          {
            title: "Variety",
            value: "Bankye hemaa",
          },
          {
            title: "Incoterms",
            value: "EXW, FCA",
          },
          {
            title: "Price",
            value: "350",
          },
        ],
      },
      {
        id: "sweet-potato",
        name: "Sweet Potato",
        image: SweetPotatoImg.src,
        category: "Roots and tubers",
        quantity: 30000,
        details: [
          {
            title: "Variety",
            value: "Orange flesh",
          },
          {
            title: "Incoterms",
            value: "CIF, DDP",
          },
          {
            title: "Price",
            value: "300",
          },
        ],
      },
      {
        id: "ginger",
        name: "Ginger",
        image: GingerImg.src,
        category: "Roots and tubers",
        quantity: 30000,
        details: [
          {
            title: "Variety",
            value: "Local",
          },
          {
            title: "Incoterms",
            value: "EXW, FCA",
          },
          {
            title: "Price",
            value: "450",
          },
        ],
      },
      {
        id: "soybean",
        name: "Soybean",
        image: SoybeanImg.src,
        category: "Roots and tubers",
        quantity: 30000,
        details: [
          {
            title: "Variety",
            value: "White",
          },
          {
            title: "Incoterms",
            value: "CIF, DAP",
          },
          {
            title: "Price",
            value: "600",
          },
        ],
      },
    ],
    buttonLabel: "Remove",
  },
  {
    label: "More crops",
    products: [
      {
        id: "sheanut",
        name: "Sheanut",
        image: SheaImg.src,
        category: "Roots and tubers",
        quantity: 30000,
        details: [
          {
            title: "Variety",
            value: "Irish",
          },
          {
            title: "Incoterms",
            value: "FOB, CFR",
          },
          {
            title: "Price",
            value: "320",
          },
        ],
      },
      {
        id: "taro",
        name: "Taro",
        image: PineappleImg.src,
        category: "Roots and tubers",
        quantity: 30000,
        details: [
          {
            title: "Variety",
            value: "Bamboo",
          },
          {
            title: "Incoterms",
            value: "EXW, DDP",
          },
          {
            title: "Price",
            value: "380",
          },
        ],
      },
      {
        id: "avocado",
        name: "Avocado",
        image: AvocadoImg.src,
        category: "Roots and tubers",
        quantity: 30000,
        details: [
          {
            title: "Variety",
            value: "Red globe",
          },
          {
            title: "Incoterms",
            value: "FOB, CIF",
          },
          {
            title: "Price",
            value: "500",
          },
        ],
      },
      {
        id: "chili-pepper",
        name: "Chili Pepper",
        image: ChiliPepperImg.src,
        category: "Roots and tubers",
        quantity: 30000,
        details: [
          {
            title: "Variety",
            value: "Daikon",
          },
          {
            title: "Incoterms",
            value: "EXW, FCA",
          },
          {
            title: "Price",
            value: "250",
          },
        ],
      },
    ],
    buttonLabel: "Add",
  },
];
