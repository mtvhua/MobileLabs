# AI Chef - Módulo 5: Firebase AI Logic

Aplicación Android que combina Firebase Authentication, Cloud Firestore e inteligencia artificial (Firebase AI Logic con Gemini) para generar recetas a partir de imágenes de ingredientes.

## Descripción

AI Chef es una aplicación educativa que demuestra la integración de la suite moderna de Firebase:
- **Firebase Auth**: Autenticación de usuarios con email/password
- **Cloud Firestore**: Base de datos NoSQL en tiempo real
- **Firebase AI Logic**: El nuevo SDK unificado (2025) para acceder a modelos Gemini
  - Generación de recetas a partir de imágenes de ingredientes
  - Generación de imágenes del plato terminado con IA

## Screenshots

| Mis Recetas | Generar Receta | Detalle del Plato |
|:---:|:---:|:---:|
| <img src="assets/screenshot_list.png" width="250" /> | <img src="assets/screenshot_generator.png" width="250" /> | <img src="assets/screenshot_detail.png" width="250" /> |

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        UI LAYER                              │
│  ┌───────────┐ ┌──────────┐ ┌─────────────┐ ┌────────────┐ │
│  │AuthScreen │ │HomeScreen│ │GeneratorScr.│ │DetailScreen│ │
│  └─────┬─────┘ └────┬─────┘ └──────┬──────┘ └─────┬──────┘ │
│        └────────────┴──────────────┴──────────────┘         │
│                           ▼                                  │
│                   ┌──────────────┐                           │
│                   │ ChefViewModel │                          │
│                   └──────┬───────┘                           │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                          ▼              DATA LAYER           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   REPOSITORIES                        │   │
│  ├──────────┬─────────────┬─────────────┬───────────────┤   │
│  │ AuthRepo │FirestoreRepo│ StorageRepo │AiLogicDataSrc │   │
│  └────┬─────┴──────┬──────┴──────┬──────┴───────┬───────┘   │
│       ▼            ▼             ▼               ▼          │
│  ┌────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐   │
│  │Firebase│  │  Cloud   │  │ Firebase │  │ Firebase AI │   │
│  │  Auth  │  │ Firestore│  │ Storage  │  │   Logic     │   │
│  └────────┘  └──────────┘  └──────────┘  │  (Gemini)   │   │
│                                           └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Configuración Inicial (IMPORTANTE)

### Paso 1: Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en **"Agregar proyecto"**
3. Ingresa un nombre (ej: "ai-chef-curso")
4. Habilita o deshabilita Google Analytics según prefieras
5. Click en **"Crear proyecto"**

### Paso 2: Registrar la App Android

1. En la página principal del proyecto, click en el ícono de Android
2. Ingresa los datos:
   - **Nombre del paquete**: `com.curso.android.module5.aichef`
   - **Apodo de la app**: AI Chef (opcional)
   - **Certificado SHA-1**: (ver instrucciones abajo)
3. Click en **"Registrar app"**

#### Obtener SHA-1 para Debug

```bash
# macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Windows
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

### Paso 3: Descargar google-services.json

1. Descarga el archivo `google-services.json`
2. **Colócalo en la carpeta `/app`** del proyecto
3. Este archivo contiene la configuración de Firebase (NO lo subas a repositorios públicos)

### Paso 4: Habilitar Firebase Authentication

1. En Firebase Console, ve a **Build > Authentication**
2. Click en **"Comenzar"**
3. En la pestaña **Sign-in method**:
   - Habilita **"Correo electrónico/contraseña"**
   - Click en **"Guardar"**

### Paso 5: Configurar Cloud Firestore

#### 5.1 Crear la Base de Datos

1. Ve a **Build > Firestore Database**
2. Click en **"Crear base de datos"**
3. Selecciona modo de **producción** o **prueba**
4. Selecciona ubicación del servidor (ej: `us-central1`)

#### 5.2 Configurar Reglas de Seguridad

Ve a la pestaña **Rules** y configura:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /recipes/{recipeId} {
      // Leer: usuarios autenticados (el filtro por userId se aplica en el código)
      allow read: if request.auth != null;

      // Crear: usuario autenticado con su propio userId
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.userId;

      // Actualizar/Eliminar: solo el propietario
      allow update, delete: if request.auth != null
                            && request.auth.uid == resource.data.userId;
    }
  }
}
```

> **Nota**: La regla de lectura permite a usuarios autenticados leer, pero el código del cliente filtra por `userId`. Esto es necesario porque Firestore no puede evaluar `resource.data` en queries antes de ejecutarlos.

#### 5.3 Crear Índice Compuesto (IMPORTANTE)

La app usa un query que combina filtro + ordenamiento:
```kotlin
.whereEqualTo("userId", uid)
.orderBy("createdAt", Direction.DESCENDING)
```

Firestore requiere un **índice compuesto** para este tipo de queries:

1. Ve a **Firestore Database > Indexes**
2. Click en **"Create index"** o **"Add index"**
3. Configura:
   - **Collection ID**: `recipes`
   - **Fields**:
     - `userId` - Ascending
     - `createdAt` - Descending
4. Click en **"Create"**

El índice tardará unos minutos en crearse (estado "Building...").

> **Alternativa**: Si ejecutas la app sin el índice, Firestore mostrará un error en Logcat con un enlace directo para crear el índice automáticamente.

### Paso 6: Configurar Firebase Storage (Cache de Imágenes)

Firebase Storage se usa para almacenar las imágenes generadas por IA, evitando regenerarlas en cada visualización.

> **⚠️ IMPORTANTE: Firebase Storage requiere el plan Blaze (pay-as-you-go)**
>
> A diferencia de Auth y Firestore que tienen generosos límites gratuitos, Storage requiere habilitar facturación. Sin embargo, los costos son muy bajos para uso educativo (centavos por GB).

#### 6.1 Habilitar Billing (Plan Blaze)

1. En Firebase Console, click en **⚙️ Configuración del proyecto** (engranaje)
2. Ve a la pestaña **Uso y facturación** o **Usage and billing**
3. Click en **Detalles y configuración** o **Details & settings**
4. Click en **Modificar plan** o **Modify plan**
5. Selecciona **Blaze (pay as you go)**
6. Vincula o crea una cuenta de Google Cloud Billing
7. Confirma el cambio de plan

**Costos aproximados de Storage:**
| Recurso | Costo |
|---------|-------|
| Almacenamiento | $0.026/GB/mes |
| Descarga | $0.12/GB |
| Operaciones | $0.05/10,000 |

> **Tip**: Para proyectos educativos, los costos suelen ser menores a $1/mes. Puedes configurar alertas de presupuesto en Google Cloud Console.

#### 6.2 Crear el Bucket de Storage

1. Ve a **Build > Storage**
2. Click en **"Get started"** o **"Comenzar"**
3. Selecciona el modo de seguridad (empezar en modo de prueba está bien)
4. Selecciona la ubicación del bucket (misma región que Firestore)

#### 6.3 Configurar Reglas de Seguridad

Ve a la pestaña **Rules** y configura:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Carpeta de imágenes de recetas
    match /recipe_images/{imageId} {
      // Leer: usuarios autenticados
      allow read: if request.auth != null;

      // Escribir: usuarios autenticados (máximo 5MB)
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

**Conceptos clave de las reglas:**
- `request.auth != null`: Solo usuarios autenticados
- `request.resource.size`: Limita tamaño máximo del archivo
- `contentType.matches('image/.*')`: Solo permite archivos de imagen

#### 6.4 Habilitar App Check para Storage

Para mayor seguridad, habilita App Check en Storage:

1. Ve a **Build > App Check**
2. En la pestaña **APIs**, busca **Cloud Storage**
3. Click en **Enforce** o **Aplicar**
4. Confirma la activación

> **Nota**: Después de habilitar App Check en Storage, solo las apps verificadas podrán acceder. Asegúrate de tener el Debug Token configurado (ver Paso 8).

### Paso 7: Habilitar Firebase AI Logic 

1. Ve a **Build > AI Logic** o **AI > AI Logic** 
2. Click en **"Comenzar"** o **"Get started"**
3. Selecciona el **Gemini API provider**:
   - **Gemini Developer API**: Recomendado para empezar (gratis con límites)
   - **Vertex AI**: Para producción enterprise (requiere billing)
4. Acepta los términos de servicio
5. La API estará habilitada automáticamente

> **Nota**: Firebase AI Logic NO requiere que agregues API Keys en tu código. La autenticación se maneja a través de `google-services.json` y Firebase App Check.

### Paso 8: Configurar Firebase App Check 

Firebase AI Logic **requiere** App Check habilitado. Sigue estos pasos:

#### 8.1 Registrar la App en Firebase Console

1. Ve a **Build > App Check**
2. Click en **"Get started"** o **"Comenzar"**
3. En la pestaña **Apps**, busca tu app Android
4. Click en **Register** y selecciona **Debug provider**
5. Confirma el registro

#### 8.2 Obtener el Debug Token

1. Ejecuta la app en el emulador o dispositivo
2. Abre **Logcat** en Android Studio
3. Filtra por `DebugAppCheckProvider`
4. Busca un mensaje como:
   ```
   D DebugAppCheckProvider: Enter this debug secret into the allow list:
   XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   ```
5. Copia el token (formato UUID)

#### 8.3 Registrar el Debug Token

1. En Firebase Console, ve a **Build > App Check > Apps**
2. Click en los **3 puntos** (⋮) junto a tu app
3. Selecciona **Manage debug tokens**
4. Click en **Add debug token**
5. Pega el token copiado del Logcat
6. Click en **Save**

#### 8.4 Reiniciar la App

Después de registrar el token, reinicia la app. Firebase AI Logic ahora funcionará correctamente.

> **Nota**: Cada emulador/dispositivo genera un token único. Si cambias de dispositivo, deberás registrar un nuevo token.

#### Para Producción

En producción, reemplaza el Debug Provider por **Play Integrity**:
1. En App Check, registra la app con **Play Integrity**
2. En el código, usa `PlayIntegrityAppCheckProviderFactory` en lugar de `DebugAppCheckProviderFactory`

## Hilt - Inyección de Dependencias

Este módulo utiliza **Hilt** para inyección de dependencias, a diferencia de los módulos anteriores que usan Koin.

### ¿Por qué Hilt?

| Característica | Hilt | Koin |
|---------------|------|------|
| Tipo | Compile-time (anotaciones) | Runtime (DSL Kotlin) |
| Performance | Más rápido (generación de código) | Más lento (reflexión) |
| Errores | En compilación | En ejecución |
| Curva de aprendizaje | Más pronunciada | Más suave |
| Boilerplate | Más código | Menos código |
| Soporte Google | Oficial para Android | Comunidad |

> **Nota**: Hilt no se cubrió en el curso pero se incluye como referencia avanzada. Koin es igualmente válido para proyectos profesionales.

### Componentes de Hilt en este Proyecto

```kotlin
// 1. Application con @HiltAndroidApp
@HiltAndroidApp
class AiChefApplication : Application()

// 2. Activity con @AndroidEntryPoint
@AndroidEntryPoint
class MainActivity : ComponentActivity()

// 3. ViewModel con @HiltViewModel e @Inject
@HiltViewModel
class ChefViewModel @Inject constructor(
    private val authRepository: IAuthRepository,  // Interfaces, no implementaciones
    private val firestoreRepository: IFirestoreRepository
) : ViewModel()

// 4. Module con @Binds para conectar interfaces → implementaciones
@Module
@InstallIn(SingletonComponent::class)
abstract class AppModule {
    @Binds @Singleton
    abstract fun bindAuthRepository(impl: AuthRepository): IAuthRepository
}
```

### Interfaces para Testabilidad

Todos los repositorios implementan interfaces:

```
IAuthRepository      ←── AuthRepository
IFirestoreRepository ←── FirestoreRepository
IStorageRepository   ←── StorageRepository
IAiLogicDataSource   ←── AiLogicDataSource
```

**Beneficios:**
- Tests unitarios pueden usar mocks/fakes
- Cambiar implementación sin modificar ViewModel
- Cumple el principio de Inversión de Dependencias (DIP)

## Unit Tests

El proyecto incluye tests unitarios para demostrar testing con mocks.

### Ejecutar Tests

```bash
# Todos los tests
./gradlew test

# Tests específicos
./gradlew testDebugUnitTest

# Con reporte HTML
./gradlew test --info
# Reporte en: app/build/reports/tests/
```

### Tests Incluidos

| Archivo | Descripción |
|---------|-------------|
| `RetryUtilTest.kt` | Tests de exponential backoff |
| `ChefViewModelTest.kt` | Tests del ViewModel con mocks |

### Librerías de Testing

```kotlin
// MockK - Mocking para Kotlin
testImplementation("io.mockk:mockk:1.13.13")

// Coroutines Test - Testing de suspend functions
testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.9.0")

// Turbine - Testing de Flows
testImplementation("app.cash.turbine:turbine:1.2.0")
```

### Ejemplo de Test con MockK

```kotlin
@Test
fun `signIn updates state on success`() = runTest {
    // Given
    coEvery { authRepository.signIn(any(), any()) } returns Result.success("user-id")

    // When
    viewModel.signIn("test@example.com", "password")
    advanceUntilIdle()

    // Then
    assertTrue(viewModel.authUiState.value is UiState.Success)
    coVerify { authRepository.signIn("test@example.com", "password") }
}
```

## Retry con Exponential Backoff

Las llamadas a la API de Gemini pueden fallar temporalmente. El proyecto incluye un utility para reintentos:

```kotlin
// Uso básico
val result = retryWithExponentialBackoff(
    maxRetries = 3,
    initialDelayMs = 1000L,
    factor = 2.0,
    maxDelayMs = 10000L
) {
    aiLogicDataSource.generateRecipeFromImage(bitmap)
}

// Solo errores de red
val result = retryOnNetworkError(maxRetries = 3) {
    apiCall()
}
```

**Patrón de delays:**
```
Intento 1: Falla → Espera 1s
Intento 2: Falla → Espera 2s
Intento 3: Falla → Espera 4s
Intento 4: Falla → Espera 8s (capped a maxDelay)
```

Ver `util/RetryUtil.kt` para documentación completa.

## Constantes de Imagen

Las constantes para procesamiento de imágenes están centralizadas en `util/ImageConstants.kt`:

```kotlin
object ImageConstants {
    const val MAX_IMAGE_DIMENSION = 1024  // Máximo px para Gemini
    const val JPEG_QUALITY = 85           // Balance calidad/tamaño
    const val MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024  // 4MB
}
```

**¿Por qué 1024px?**
- Gemini puede procesar imágenes más grandes, pero:
  - Mayor tamaño = Mayor tiempo de procesamiento
  - Mayor tamaño = Mayor consumo de datos
  - 1024px es suficiente para identificar ingredientes

## Estructura del Proyecto

```
app/src/main/java/com/curso/android/module5/aichef/
├── AiChefApplication.kt          # @HiltAndroidApp + AppCheck
├── MainActivity.kt               # @AndroidEntryPoint + Navigation
│
├── di/
│   └── AppModule.kt              # Hilt Module con @Binds
│
├── data/
│   ├── remote/
│   │   ├── IAiLogicDataSource.kt # Interface
│   │   └── AiLogicDataSource.kt  # Firebase AI Logic (Gemini)
│   └── firebase/
│       ├── IAuthRepository.kt    # Interface
│       ├── AuthRepository.kt     # Firebase Auth wrapper
│       ├── IFirestoreRepository.kt # Interface
│       ├── FirestoreRepository.kt # Firestore wrapper
│       ├── IStorageRepository.kt # Interface
│       └── StorageRepository.kt  # Firebase Storage
│
├── domain/
│   └── model/
│       ├── Recipe.kt             # Modelo de receta
│       └── UiState.kt            # Estados de UI
│
├── util/
│   ├── RetryUtil.kt              # Exponential backoff
│   └── ImageConstants.kt         # Constantes de imagen
│
└── ui/
    ├── viewmodel/
    │   └── ChefViewModel.kt      # @HiltViewModel
    ├── screens/
    │   ├── AuthScreen.kt         # Login/Registro
    │   ├── HomeScreen.kt         # Lista de recetas
    │   ├── GeneratorScreen.kt    # Generador con IA
    │   └── RecipeDetailScreen.kt # Detalle + imagen generada
    └── theme/
        └── Theme.kt              # Material 3 Theme

app/src/test/java/com/curso/android/module5/aichef/
├── viewmodel/
│   └── ChefViewModelTest.kt      # Tests del ViewModel
└── util/
    └── RetryUtilTest.kt          # Tests de RetryUtil
```

## Firebase AI Logic - Conceptos Clave

### ¿Qué es Firebase AI Logic?

Firebase AI Logic (anteriormente "Vertex AI in Firebase") es el SDK oficial de Google para integrar modelos de IA generativa (Gemini) en aplicaciones móviles y web.

### ¿Por qué usar Firebase AI Logic en lugar del SDK cliente directo?

| Característica | Firebase AI Logic | SDK Cliente Directo |
|---------------|-------------------|---------------------|
| API Keys | No requeridas en código | Requiere API Key hardcodeada |
| Seguridad | Firebase App Check | Ninguna integrada |
| Billing | A través de Firebase/GCP | Directo con Google AI |
| Integración | Auth, Firestore, Storage | Standalone |
| Producción | Recomendado | No recomendado |

### Ejemplo de Uso

```kotlin
// Inicialización
val model = Firebase.ai(backend = GenerativeBackend.googleAI())
    .generativeModel("gemini-3-flash-preview")

// Contenido multimodal (texto + imagen)
val prompt = content {
    image(bitmap)
    text("Describe esta imagen")
}

// Generación
val response = model.generateContent(prompt)
val text = response.text
```

### Modelos Disponibles (Diciembre 2025)

| Modelo | Descripción | Caso de uso |
|--------|-------------|-------------|
| `gemini-3-flash-preview` | Rápido y eficiente | Análisis de imágenes, generación de texto |
| `gemini-3-pro-image-preview` | Generación de imágenes | Crear imágenes del plato terminado |
| `gemini-3-pro-preview` | El más avanzado | Tareas complejas |

> **Nota**: Este proyecto usa `gemini-3-flash-preview` para analizar ingredientes y `gemini-3-pro-image-preview` para generar imágenes del plato.

### Generación de Imágenes con Gemini

Para generar imágenes, el modelo debe configurarse con `responseModalities`:

```kotlin
// Configuración del modelo para generar imágenes
val imageModel = Firebase.ai(backend = GenerativeBackend.googleAI())
    .generativeModel(
        modelName = "gemini-3-pro-image-preview",
        generationConfig = generationConfig {
            // IMPORTANTE: Debe incluir TEXT e IMAGE
            responseModalities = listOf(ResponseModality.TEXT, ResponseModality.IMAGE)
        }
    )

// Generar imagen
val response = imageModel.generateContent("Genera una imagen de pasta carbonara")

// Extraer el Bitmap de la respuesta
val bitmap = response.candidates
    .firstOrNull()
    ?.content
    ?.parts
    ?.filterIsInstance<ImagePart>()
    ?.firstOrNull()
    ?.image
```

**Conceptos clave:**
- `responseModalities`: Configura qué tipo de contenido puede generar el modelo
- `ImagePart`: Clase que representa una parte de imagen en la respuesta
- `.image`: Propiedad que devuelve el `Bitmap` de Android directamente

## Dependencias Clave

```kotlin
// Firebase BoM - Sincroniza versiones automáticamente
implementation(platform("com.google.firebase:firebase-bom:34.7.0"))

// Firebase Auth
implementation("com.google.firebase:firebase-auth")

// Cloud Firestore
implementation("com.google.firebase:firebase-firestore")

// Firebase Storage (cache de imágenes generadas)
implementation("com.google.firebase:firebase-storage")

// Firebase AI Logic (EL SDK CORRECTO)
implementation("com.google.firebase:firebase-ai")

// Coil para carga de imágenes desde URLs
implementation("io.coil-kt:coil-compose:2.7.0")

// Hilt - Inyección de Dependencias
implementation("com.google.dagger:hilt-android:2.51.1")
kapt("com.google.dagger:hilt-compiler:2.51.1")
implementation("androidx.hilt:hilt-navigation-compose:1.2.0")

// Testing
testImplementation("io.mockk:mockk:1.13.13")
testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.9.0")
testImplementation("app.cash.turbine:turbine:1.2.0")

// NO USAR:
// - com.google.firebase:firebase-vertexai (legacy/renombrado)
// - com.google.ai.client.generativeai (cliente directo, inseguro)
```

## Flujo de la Aplicación

1. **Autenticación**:
   - Usuario ingresa email/password
   - Firebase Auth valida credenciales
   - Se guarda sesión localmente

2. **Vista de Recetas** (HomeScreen):
   - Query a Firestore: `recipes.where("userId", "==", auth.uid)`
   - Observación en tiempo real con Flow
   - Lista actualizada automáticamente
   - Click en receta → navega a detalle

3. **Generación de Receta** (GeneratorScreen):
   - Usuario selecciona imagen (Photo Picker)
   - Imagen se envía a Firebase AI Logic (Gemini)
   - Gemini analiza y genera receta
   - Receta se guarda en Firestore
   - Usuario regresa a Home

4. **Detalle de Receta** (RecipeDetailScreen):
   - Muestra ingredientes y pasos completos
   - Sistema de cache de imágenes generadas:
     - Primera visita: Genera imagen con IA, sube a Storage, guarda URL
     - Visitas posteriores: Usa URL guardada (sin consumir cuota)
   - Usa `gemini-3-pro-image-preview` para crear imagen fotorealista
   - Coil para carga eficiente de imágenes desde URL
   - Estados de UI: Loading → Success/Error
   - Opción de reintentar si falla la generación

## Solución de Problemas

### Error: "Firebase AI Logic not enabled"
- Verifica que habilitaste AI Logic en Firebase Console
- Asegúrate de que `google-services.json` está actualizado

### Error: "App Check token invalid" o "AppCheck not registered"
- Verifica que registraste la app en **Build > App Check** en Firebase Console
- Asegúrate de seleccionar **Debug provider** al registrar
- Busca el debug token en Logcat (filtrar por `DebugAppCheckProvider`)
- Registra el token en **App Check > Apps > Manage debug tokens**
- Reinicia la app después de registrar el token
- Cada emulador/dispositivo tiene un token único

### Error: "PERMISSION_DENIED"
- Verifica las reglas de Firestore
- Asegúrate de estar autenticado
- Revisa App Check si está habilitado

### Error: "Quota exceeded"
- El plan gratuito tiene límites diarios
- Considera actualizar a Blaze (pay-as-you-go)
- Implementa retry con backoff exponencial

### Error: "Model not found"
- Verifica el nombre del modelo (`gemini-3-flash-preview`)
- Algunos modelos requieren acceso especial
- Los modelos preview pueden cambiar - consulta la documentación oficial

### Error: "Storage PERMISSION_DENIED"
- Verifica que configuraste las reglas de Firebase Storage
- Asegúrate de que el usuario está autenticado
- Revisa que el archivo no exceda 5MB
- Confirma que el contentType es de tipo imagen

## Cache de Imágenes

La app implementa un sistema de cache para las imágenes generadas por IA:

```
┌───────────────┐     ┌────────────────────┐     ┌───────────────┐
│ RecipeDetail  │────▶│  ¿Tiene imageUrl?  │─Sí─▶│ Coil carga    │
│    Screen     │     │  (Firestore)       │     │ desde Storage │
└───────────────┘     └─────────┬──────────┘     └───────────────┘
                                │No
                                ▼
                      ┌────────────────────┐
                      │ Generar con Gemini │
                      │ (consume cuota)    │
                      └─────────┬──────────┘
                                ▼
                      ┌────────────────────┐
                      │ Subir a Storage    │
                      │ Guardar URL        │
                      └────────────────────┘
```

**Beneficios:**
- Ahorro de cuota de API (solo genera una vez por receta)
- Carga más rápida en visitas posteriores
- Coil maneja cache local adicional (memoria + disco)

## Mejoras Futuras

- [x] Vista detalle de receta con todos los pasos
- [x] Generación de imagen del plato terminado con IA
- [x] Cache de imágenes generadas en Firebase Storage
- [x] Hilt para inyección de dependencias
- [x] Interfaces para testabilidad
- [x] Unit tests con MockK y Turbine
- [x] Retry con exponential backoff
- [x] Constantes centralizadas para imágenes
- [ ] Edición de recetas generadas
- [ ] Compartir recetas
- [ ] Historial de imágenes analizadas
- [ ] Play Integrity para producción (reemplazar Debug Provider)
- [ ] Analytics para métricas de uso

---

## Créditos

Este proyecto ha sido generado usando **Claude Code** y adaptado con fines educativos por **Adrián Catalán**.

### Referencias

- [Firebase AI Logic Documentation](https://firebase.google.com/docs/ai-logic)
- [Get Started with Gemini API](https://firebase.google.com/docs/ai-logic/get-started)
- [Firebase Auth for Android](https://firebase.google.com/docs/auth/android/start)
- [Cloud Firestore for Android](https://firebase.google.com/docs/firestore/quickstart)

### Versiones Verificadas (Diciembre 2025)

- Firebase BoM: 34.7.0
- Firebase AI Logic: Incluido en BoM (firebase-ai)
- Firebase Storage: Incluido en BoM (firebase-storage)
- Modelos Gemini:
  - `gemini-3-flash-preview` (análisis de imágenes)
  - `gemini-3-pro-image-preview` (generación de imágenes)
- Coil: 2.7.0 (carga de imágenes)
- Jetpack Compose: BOM 2024.12.01
- Android Gradle Plugin: 8.13.2
- Gradle: 8.13
- Kotlin: 2.0.21

---

**Licencia**: Proyecto educativo - Uso libre con atribución
