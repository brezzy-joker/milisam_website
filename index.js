 body{
    background:#0f0f0f;
    color: #f5f5f5;
    font - family: Arial, sans - serif;
    overflow - x: hidden;
}

    html{
    scroll - behavior: smooth;
}

    /* NAVBAR */

    .navbar{
    background:#121212;
    border - bottom: 2px solid #b88746;
    transition: 0.4s;
}

    .navbar - brand img{
    width: 60px;
    height: 60px;
    object - fit: contain;
}

    .nav - link{
    color: #f5f5f5!important;
    margin - left: 15px;
    transition: 0.3s;
}

    .nav - link:hover{
    color: #d4a15c!important;
}

    .active - link{
    color: #d4a15c!important;
    font - weight: bold;
}

    /* HERO */

    .hero{
    min - height: 100vh;

    background:
    linear - gradient(
        rgba(0, 0, 0, 0.85),
        rgba(0, 0, 0, 0.90)
    ),
        url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1600');

    background - size: cover;
    background - position: center;

    display: flex;
    align - items: center;
}

    .gold - text{
    color: #d4a15c;
}

    /* BUTTONS */

    .btn{
    transition: 0.3s ease;
}

    .btn:hover{
    transform: translateY(-3px);
}

    .btn - gold{
    background: #b88746;
    color:#111;
    border: none;
    font - weight: bold;
}

    .btn - gold:hover{
    background: #d4a15c;
    color:#111;
}

    /* SERVICES */

    .service - card{
    background:#171717;
    border: 1px solid #8a6537;
    border - radius: 25px;

    opacity: 0;
    transform: translateY(50px);

    transition:all 0.8s ease;
}

    .show - card{
    opacity: 1;
    transform: translateY(0);
}

    .service - card:hover{
    transform: translateY(-12px) scale(1.02);
    background:#1e1e1e;
}

    .service - circle{
    width: 90px;
    height: 90px;
    background:#111;
    border: 2px solid #b88746;
    border - radius: 50 %;

    display: flex;
    align - items: center;
    justify - content: center;
}

    .service - icon{
    font - size: 40px;
    color: #d4a15c;
}

    /* CONTACT */

    .contact - box{
    background:#171717;
    border: 1px solid #8a6537;
    border - radius: 25px;
}

    /* FORMS */

    .form - control{
    background:#111;
    border: 1px solid #555;
    color: white;
}

    .form - control:focus{
    background:#111;
    color: white;
    border - color: #d4a15c;
    box - shadow: none;
}

    .form - control::placeholder{
    color: #bbb;
}

    /* SCROLLBAR */

    :: -webkit - scrollbar{
    width: 10px;
}

    :: -webkit - scrollbar - track{
    background:#111;
}

    :: -webkit - scrollbar - thumb{
    background: #b88746;
    border - radius: 20px;
}

    :: -webkit - scrollbar - thumb:hover{
    background: #d4a15c;
}

    /* FOOTER */

    footer{
    border - top: 1px solid #8a6537;
}

