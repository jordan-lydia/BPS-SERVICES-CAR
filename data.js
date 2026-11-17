// Connexion Supabase. La clé « publishable » peut être publique : la sécurité repose sur les règles RLS de la base.
// Ne mettez JAMAIS ici le mot de passe de la base ni une clé « secret » / « service_role ».
const SUPABASE_URL = "https://ktdnevesgdmhophcozjv.supabase.co";
const SUPABASE_KEY = "sb_publishable_oTVUFwPu77U_Ojyf2HTUqQ_F8SHywT5";

// Stock de démonstration, affiché seulement si la base est injoignable.
const FALLBACK = [
  {ref_no:1,mode:"vente",make:"Toyota",model:"Land Cruiser Prado",year:2019,body_type:"SUV",fuel:"Diesel",steering:"Gauche",price:38500,mileage:62000,city:"Lubumbashi",tags:["x"],available:true},
  {ref_no:2,mode:"vente",make:"Toyota",model:"Hilux",year:2021,body_type:"Pick-up",fuel:"Diesel",steering:"Gauche",price:32000,mileage:41000,city:"Kolwezi",tags:["n"],available:true},
  {ref_no:3,mode:"vente",make:"Mercedes-Benz",model:"Classe E 250",year:2018,body_type:"Berline",fuel:"Essence",steering:"Gauche",price:27500,mileage:78000,city:"Lubumbashi",tags:["x"],available:true},
  {ref_no:4,mode:"vente",make:"Hyundai",model:"Santa Fe",year:2020,body_type:"SUV",fuel:"Diesel",steering:"Gauche",price:24000,mileage:55000,city:"Likasi",tags:["p"],available:true},
  {ref_no:5,mode:"location",make:"Toyota",model:"Corolla",year:2021,body_type:"Berline",fuel:"Essence",steering:"Gauche",price:60,mileage:0,city:"Lubumbashi",tags:[],available:true},
  {ref_no:6,mode:"location",make:"Toyota",model:"Land Cruiser V8",year:2020,body_type:"SUV",fuel:"Diesel",steering:"Gauche",price:180,mileage:0,city:"Lubumbashi",tags:["x"],available:true}
];
