# RiftCampus

RiftCampus es una aplicación web desarrollada a modo de proyecto para la materia Prácticas Profecinalizante II de la carrera TSAFI 2026 orientada a estudiantes que juegan League of Legends, cuyo objetivo es facilitar la formación de equipos mediante un sistema de matchmaking basado en compatibilidad entre jugadores.

La plataforma conecta usuarios no solo por nivel de juego, sino también por rol, disponibilidad horaria y objetivos, permitiendo formar equipos más equilibrados y organizar partidas de manera eficiente.

---

## Stack tecnológico

* React + Vite
* Tailwind CSS v4
* PHP + Laravel '?' ... a definir
* MySQL

---


## Estado del proyecto

En desarrollo (MVP)

Actualmente incluye:

* Configuración inicial del proyecto con Vite
* Integración de Tailwind CSS
* Estructura base del frontend
* Primeras interfaces en desarrollo

---

## Objetivos

* Facilitar la búsqueda de compañeros de equipo
* Formar equipos equilibrados según distintos criterios
* Organizar partidas según disponibilidad horaria
* Implementar un sistema de interacción tipo match

---

## Funcionalidades previstas

* Registro e inicio de sesión
* Creación y edición de perfil:

  * Rol (Top, Jungle, Mid, ADC, Support)
  * Rango
  * Horarios disponibles
* Visualización de otros jugadores
* Sistema de compatibilidad
* Sistema de match 
* Sistema de reputación
* Comentarios en perfiles

---

## Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/JuksZZZ/riftcampus.git
cd riftcampus
```

---

### 2. Frontend

```bash
cd riftcampus
npm install
npm run dev
```

---

### 3. Backend (Laravel?)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

---

## Estructura del proyecto

```
riftcampus/
├── riftcampus/   # Frontend (React)
├── backend/      # Backend (Laravel)
```

---

## Roadmap

* Diseño de interfaces principales (match y perfiles)
* Desarrollo del sistema de perfiles
* Implementación del backend con Laravel
* Sistema de autenticación
* Sistema de matchmaking
* Integración completa entre frontend y backend

---

## Autor

Joaquin Uriel Kloster
Estudiante y desarrollador Full Stack en desarrollo de este proyecto

---

## Licencia

Este proyecto es de uso académico.
