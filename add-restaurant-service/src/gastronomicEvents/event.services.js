import GastronomicEvent from './event.model.js';

export const createGastronomicEventService = async (data) => {
    const event = new GastronomicEvent(data);
    await event.save();
    return event;
};

export const getGastronomicEventsService = async () => {
    return await GastronomicEvent.find();
};

export const getGastronomicEventByIdService = async (id) => {
    const event = await GastronomicEvent.findById(id);
    if (!event) throw new Error('Evento gastronómico no encontrado');
    return event;
};

export const updateGastronomicEventService = async (id, data) => {
    const event = await GastronomicEvent.findByIdAndUpdate(id, data, { new: true });
    if (!event) throw new Error('Evento gastronómico no encontrado');
    return event;
};

export const deleteGastronomicEventService = async (id) => {
    const event = await GastronomicEvent.findByIdAndDelete(id);
    if (!event) throw new Error('Evento gastronómico no encontrado');
    return event;
};

//logica que el usuario puede realizar con eventos, promociones, cupones
export const joinEventService = async(eventId, userId) =>{
    const event = await GastronomicEvent.findById(eventId);
    if(!event) throw new Error("Evento no encontrado");
    if(event.type !== 'event') throw new Error("Solo puedes inscribirte a eventos, no a promociones o cupones");
    if(event.status !== 'active') throw new Error("El evento no está activo, lo siento ;v");

    if(event.max_capacity && event.current_capacity >= event.max_capacity) throw new Error("El evento está lleno");
    
    const inscrito = event.inscripciones.some(i => i.userId.toString() == userId);
    if(inscrito) throw new Error("Ya estás inscrito a este evento");
    event.inscripciones.push({ userId });
    event.current_capacity += 1;
    await event.save();

    return{
        evento: event.name,
        cuposRestantes: event.max_capacity ? event.max_capacity - event.current_capacity : 'sin limite',
        fechaEvento: event.schedule.start_date //cronograma
    };
    
    
};

export const leaveEventService = async (eventId, userId) =>{
    const event = await GastronomicEvent.findById(eventId);
    if(!event) throw new Error("Evento no encontrado");

    const idIns = event.inscripciones.findIndex(i => i.userId.toString() == userId);
    if(idIns == -1) throw new Error("No estás inscrito en dicho evento");
    event.inscripciones.splice(idIns, 1);
    event.current_capacity -= 1;
    await event.save();

    return{
        message: 'Inscripción cancelada con éxito'
    };
    
    
};

export const applyEventService = async(eventId, userId) =>{
    const event = await GastronomicEvent.findById(eventId);
    if(!event) throw new Error("Evento no encontrado");

    if(!['promotion', 'coupon'].includes(event.type)) throw new Error("Este endpoint es solo para las promociones y cupones");

    if(event.status !== 'active') throw new Error("Está promoción np está activa");

    const ahora = new Date();
    if(ahora < event.schedule.start_date || ahora > event.schedule.end_date) throw new Error("Está promoción ya no está vigente. Lo sentimos");

    if(event.max_usos && event.usos_actuales >= event.max_usos) throw new Error("Esta promoción ya alcanzo el límite de usos");

    if(event.type == 'coupon'){
        const yaUsado = event.usos.some( u =>
            u.userId.toString() == userId
        );
        if(yaUsado) throw new Error("Ya has usado este cupón");
        
    }

    event.usos.push({ userId });
    event.usos_actuales += 1;
    await event.save();
    
    return{
        mensaje: `${event.type == 'coupon' ? 'Cupon' : 'Promoción'} aplicado exitosamente`,
        evento: event.name, 
    };
    
    
};

export const getEventsByRestaurantService = async (restaurantId) => {
    return await GastronomicEvent.find({ 
        restaurant_id: restaurantId,
        status: 'active'
    });
};

