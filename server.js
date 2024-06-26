const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const port = process.env.PORT || 4000;
const index = require("./routes/index");

const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
let recicladores = {}
let usuarios = {}
let ofertas = {};
let ofertasSinTomar = {}
let ofertasenCurso = {};
let nombre = ""
let id = 0
io.on("connection", (socket) => {

    // console.log("New client connected", socket.id);

    socket.on("disconnect", () => {
        // console.log("Client disconnected", socket.id);
    });
    socket.on("setName", nombreenviado => {
        nombre = nombreenviado

    })


    socket.on("new-offer", (offer) => {
        
        offer.data.unshift(id);
        // console.log("New offer received:", offer);
        ofertas[nombre] = offer;
        ofertasSinTomar[nombre] = offer;
        io.emit("update-offers", Object.values(ofertasSinTomar)); 
        io.emit("myupdate-offers", ofertasenCurso);
        io.emit("myupdate-offers_usser", ofertas);
        // console.log( "ofertas:::", ofertas)
        id +=1
 
    });

    

    

    socket.on("take-offer", (offerId) => {
        // Filtra para encontrar la oferta basada en offerId
        const filteredOffers = Object.entries(ofertasSinTomar).filter(([key, value]) => value.data[0] === offerId);
        if (!(ofertasenCurso[nombre])){
            if (filteredOffers.length > 0) {

                filteredOffers[0][1].data[3] = "Asignado"; 
                // Muestra la oferta tomada
                ofertasenCurso[nombre] = filteredOffers[0][1]; // Guarda la oferta en curso
        
                // Remueve la oferta de ofertasSinTomar
                delete ofertasSinTomar[filteredOffers[0][0]];
                io.emit("update-offers", Object.values(ofertasSinTomar));
                io.emit("myupdate-offers", ofertasenCurso);
                io.emit("myupdate-offers_usser", ofertas);
                console.log(ofertas)
                // console.log(ofertasenCurso[nombre],"Entra a Take")
            } else {
                // console.log("No se encontró la oferta");
            }
        }

    });
    socket.on('updateOffers', data =>{
        io.emit("update-offers", Object.values(ofertasSinTomar));
        io.emit("myupdate-offers", ofertasenCurso);
        io.emit("myupdate-offers_usser", ofertas);

        // console.log('update offers correct: ',"myupdate-offers", ofertasenCurso)
    })

    // socket.on('offer-taken', (offerId) => {
    //     // Logic to handle the offer being taken
    //     console.log(`Offer with ID ${offerId} has been taken.`);
    //     // Perform the necessary actions, such as marking the offer as taken
    //   });


});

server.listen(port, () => console.log(`Listening on port ${port}`));
