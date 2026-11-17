// Stock exemple : remplacez par vos vrais véhicules.
// [marque, modèle, année, type, carburant, direction, prix USD, km, ville, étiquette]
// étiquettes : n = nouvel arrivage, p = promotion, x = premium, neuf = véhicule neuf (combinables : "n,x")
var ROWS=[
["Toyota","Land Cruiser Prado",2019,"SUV","Diesel","Gauche",38500,62000,"Lubumbashi","x"],
["Toyota","Hilux",2021,"Pick-up","Diesel","Gauche",32000,41000,"Kolwezi","n"],
["Toyota","RAV4",2022,"SUV","Hybride","Gauche",30500,18000,"Lubumbashi","n,x"],
["Toyota","Hiace",2018,"Van","Diesel","Gauche",21500,88000,"Likasi","p"],
["Toyota","Corolla",2020,"Berline","Essence","Gauche",14800,52000,"Lubumbashi","p"],
["Mercedes-Benz","Classe E 250",2018,"Berline","Essence","Gauche",27500,78000,"Lubumbashi","x"],
["Mercedes-Benz","GLE",2023,"SUV","Diesel","Gauche",64000,0,"Lubumbashi","neuf,x"],
["Hyundai","Santa Fe",2020,"SUV","Diesel","Gauche",24000,55000,"Likasi","n"],
["Hyundai","Tucson",2024,"SUV","Essence","Gauche",29500,0,"Kolwezi","neuf"],
["Nissan","Patrol",2017,"SUV","Essence","Gauche",29000,96000,"Kolwezi","p"],
["Nissan","Navara",2019,"Pick-up","Diesel","Gauche",17900,70000,"Lubumbashi",""],
["Honda","CR-V",2019,"SUV","Essence","Droite",19800,60000,"Likasi","n"],
["Kia","Sportage",2021,"SUV","Diesel","Gauche",22300,39000,"Lubumbashi",""],
["Isuzu","D-Max",2020,"Pick-up","Diesel","Gauche",20500,58000,"Kolwezi","p"],
["BMW","X5",2019,"SUV","Diesel","Gauche",41000,64000,"Lubumbashi","x"],
["Mitsubishi","Pajero",2016,"SUV","Diesel","Droite",15900,110000,"Kolwezi",""]];
var RENT=[
["Toyota","Corolla",60,"Lubumbashi"],["Toyota","Land Cruiser V8",180,"Lubumbashi"],
["Hyundai","Tucson",90,"Kolwezi"],["Mercedes-Benz","Classe E",160,"Likasi"]];
