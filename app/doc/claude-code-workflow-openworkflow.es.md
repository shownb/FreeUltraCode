<div align="center">
  <a href="claude-code-workflow-openworkflow.en.md">English</a> | <a href="claude-code-workflow-openworkflow.md">中文</a> | <a href="claude-code-workflow-openworkflow.fr.md">Français</a> | <a href="claude-code-workflow-openworkflow.de.md">Deutsch</a> | Español | <a href="claude-code-workflow-openworkflow.pt.md">Português</a> | <a href="claude-code-workflow-openworkflow.ru.md">Русский</a> | <a href="claude-code-workflow-openworkflow.ja.md">日本語</a> | <a href="claude-code-workflow-openworkflow.hi.md">हिन्दी</a> | <a href="claude-code-workflow-openworkflow.ar.md">العربية</a>
</div>

# Claude Code tiene Workflows. ¿Y los demás modelos? Probé OpenWorkflows

Últimamente he estado observando de cerca los workflows de Claude Code.

Lo que me interesa no es solo "otra función". Extrae el trabajo complejo de un turno de chat tras otro. Las tareas se pueden dividir en subagentes, ramas paralelas y pipelines, y luego coordinarse mediante scripts.

Eso importa porque un workflow ya no es una disposición temporal dentro de una conversación. Se convierte en algo que puedes guardar, editar y reutilizar.

Eso también me planteó una pregunta: si los workflows se están convirtiendo en una capa común en la programación con IA, ¿por qué deberían estar atados a un solo modelo o a una sola CLI?

Así que probé OpenWorkflows. Convierte los workflows al estilo de Claude Code en un lienzo visual, e intenta hacer que el mismo workflow pueda dirigirse a Claude Code, Codex, Gemini y más entornos de ejecución locales o en la nube.

Este tutorial no comienza con conceptos abstractos. Recorre las capturas de pantalla en orden. El ejemplo es concreto: hacer que OpenWorkflows admita múltiples temas de apariencia, que Pencil sea el predeterminado y que se puedan cambiar en Configuración / Apariencia.

> Esta es la versión en inglés del tutorial de uso basado en capturas de pantalla.
>
> Versión en chino: [Tutorial de uso de OpenWorkflows](claude-code-workflow-openworkflow.md)

## 0. Comienza con la interfaz final

<p align="center">
  <img src="images/0-标题使用.png" alt="Lienzo de OpenWorkflows, barra de historial, propiedades de nodo y área de entrada de IA" width="960">
</p>
<p align="center"><em>Figura 0: El espacio de trabajo principal de OpenWorkflows, con el blueprint en el centro, las propiedades del nodo a la derecha y la entrada y salida de IA en la parte inferior.</em></p>

La interfaz principal tiene cuatro partes: historial de workflows a la izquierda, el lienzo visual en el centro, propiedades del nodo y prompts comunes a la derecha, y la entrada de IA más los paneles de respuesta en la parte inferior.

El workflow de la captura de pantalla se titula "Plan de apariencia multitema de Pencil". No es un diagrama estático. Es un workflow que puedes seguir editando, convertir en script, ejecutar y revisar más tarde.

## 1. Descarga OpenWorkflows

<p align="center">
  <img src="images/1-下载.png" alt="Página de GitHub de OpenWorkflows con la entrada de Releases" width="840">
</p>
<p align="center"><em>Figura 1: Encuentra la última compilación en la sección Releases de la página de GitHub.</em></p>

La forma más rápida de probarlo es abrir la página del proyecto en GitHub y descargar la última release desde Releases.

El panel About a la derecha deja claro el posicionamiento. Se trata de un editor visual que extiende los Claude Code Workflows a Codex, Gemini y más entornos de ejecución de LLM.

Si quieres trabajar en el código, clona el repositorio y empieza desde el directorio `app/`:

```bash
npm install
npm run dev
```

Para la aplicación de escritorio, usa:

```bash
npm run desktop
```

## 2. Configura los modelos primero

<p align="center">
  <img src="images/2-配置大模型.png" alt="Página de configuración de modelos de OpenWorkflows" width="640">
</p>
<p align="center"><em>Figura 2: Configura proveedores, CLI local y el modelo predeterminado en Configuración / Modelos.</em></p>

Antes de dibujar nada, abre **Configuración / Modelos**. Aquí es donde configuras proveedores, CLIs locales, el modelo predeterminado y los canales de ejecución.

Cada proveedor muestra su estado, como predeterminado, directo, ejecución mediante CLI o no disponible. La captura de pantalla también muestra que la clave se almacena localmente.

Si ya usas `cc-switch` para gestionar configuraciones de modelos, puedes importar esos datos aquí. En la parte inferior del área de entrada de IA, también puedes elegir qué modelo o canal debe usar esta solicitud.

## 3. Crea un nuevo workflow e introduce una solicitud

<p align="center">
  <img src="images/3-新建workflow.png" alt="Creando un nuevo workflow e introduciendo una solicitud en la entrada de IA" width="840">
</p>
<p align="center"><em>Figura 3: Haz clic en Nuevo Workflow, luego describe el workflow en la entrada de IA de la esquina inferior derecha.</em></p>

Después de configurar el modelo, haz clic en **Nuevo Workflow** a la izquierda. El lienzo comienza con una estructura mínima: Inicio, un Agente y Fin.

El verdadero punto de partida no es dibujar nodos manualmente. Es la entrada de IA en la esquina inferior derecha. En este ejemplo, escribí:

```text
Quiero que OpenWorkflows admita múltiples temas de apariencia,
que Pencil sea el predeterminado,
y que se puedan cambiar en Configuración / Apariencia.
```

Después de enviarlo con `Ctrl+Enter`, o haciendo clic en el botón de enviar, OpenWorkflows convierte la solicitud en un blueprint de workflow editable.

## 4-1. Genera el blueprint del workflow

<p align="center">
  <img src="images/4-1生成workflow蓝图.png" alt="Blueprint de workflow generado a partir de la solicitud" width="960">
</p>
<p align="center"><em>Figura 4-1: La IA divide el objetivo en ramas paralelas, un nodo de resumen, nodos de implementación, validación y entrega.</em></p>

Una vez enviada la solicitud, OpenWorkflows reescribe el paso actual en un workflow completo.

El blueprint de la captura de pantalla se convierte aproximadamente en:

```text
Inicio
  -> Explorar soporte de apariencia en paralelo
      -> Investigar puntos de entrada actuales
      -> Diseñar el sistema de temas
      -> Diseñar el tema predeterminado Pencil
  -> Resumir el plan de implementación
  -> Implementar apariencia multitema
  -> Conectar el cambio en Configuración / Apariencia
  -> Validar y revisar
  -> Registrar resultados de entrega
  -> Fin
```

Lo que importa aquí no es qué tan bonito se ve el grafo. Es que un objetivo difuso se convierte en un plan ejecutable.

El panel de propiedades del nodo a la derecha sigue permitiéndote inspeccionar etiquetas, tipos, ramas, tipos de agente y schemas. La generación no te impide editar la estructura.

## 4-2. Visualiza el script generado

<p align="center">
  <img src="images/4-2蓝图脚本.png" alt="Diálogo del script de workflow generado" width="960">
</p>
<p align="center"><em>Figura 4-2: Usa el botón Script para inspeccionar el script de workflow generado a partir del lienzo.</em></p>

Hay un botón **Script** en la barra superior. Ábrelo y verás el script generado a partir del blueprint actual.

En la captura de pantalla, puedes ver estructuras `parallel(...)` y `agent(...)`. Los nodos paralelos se convierten en ramas concurrentes, y los nodos normales se convierten en llamadas individuales a agentes.

Esto demuestra que OpenWorkflows no solo dibuja cajas. El lienzo está respaldado por una estructura de workflow compartida que luego puede dirigirse a diferentes entornos de ejecución.

## 5. Sigue refinando con prompts comunes

<p align="center">
  <img src="images/5-使用常用提示词.png" alt="Panel de prompts comunes y área de entrada de IA" width="960">
</p>
<p align="center"><em>Figura 5: Los prompts comunes insertan ediciones típicas de workflow en el área de entrada de IA.</em></p>

Después de que se genera el blueprint, no tienes que ejecutarlo inmediatamente. El panel **Prompts comunes** a la derecha es mejor para refinar el flujo.

Los prompts están agrupados por escenario: aclaración, claridad, exhaustividad, coste, estructura, fiabilidad y paralelismo, y verificación.

La captura de pantalla muestra el prompt **Aclarar solicitud**. Rellena la entrada de IA con una solicitud para confirmar ambigüedades clave antes de modificar el grafo.

Eso es útil porque muchos fallos de workflow no son fallos del modelo. Ocurren porque el objetivo, los límites, las rutas de fallo o la estrategia de coste nunca se definieron con suficiente claridad.

## 6. Confirma los límites con opciones interactivas

<p align="center">
  <img src="images/6-交互选择.png" alt="Botones de opción interactiva en la respuesta de la IA" width="640">
</p>
<p align="center"><em>Figura 6: Cuando la solicitud es ambigua, la IA ofrece opciones para que confirmes el alcance primero.</em></p>

Después de elegir **Aclarar solicitud**, la IA no modifica el grafo de inmediato. En su lugar, hace una pregunta de seguimiento: ¿hasta dónde debería llegar el cambio de tema?

La captura de pantalla ofrece dos opciones: solo entregar el tema predeterminado Pencil y dejar la estructura de expansión en su lugar, o entregar Pencil más múltiples temas intercambiables.

Una vez que eliges, la IA escribe esa decisión de vuelta en el blueprint del workflow y genera el IRGraph actualizado. Eso reduce el riesgo de que la IA lleve el workflow en la dirección equivocada por su cuenta.

## 7. Haz clic en Run

<p align="center">
  <img src="images/7-运行.png" alt="Botón Run superior en OpenWorkflows" width="960">
</p>
<p align="center"><em>Figura 7: Después de que el blueprint esté listo, haz clic en Run en la barra superior.</em></p>

Después de confirmar la estructura, la configuración de modelos y los límites clave, haz clic en **Run**.

Es mejor no ejecutar el workflow en el momento en que se genera. Primero comprueba si las ramas paralelas tienen sentido, si el nodo de resumen viene después de las ramas, y si la validación cubre el resultado final.

Si un nodo solo tiene una responsabilidad poco clara, puedes editar su etiqueta, prompt, tipo de agente o schema antes de volver a ejecutar.

## 8. Observa el estado de ejecución

<p align="center">
  <img src="images/8-运行中.png" alt="Estado de ejecución con botón de detener" width="960">
</p>
<p align="center"><em>Figura 8: Durante la ejecución, el botón cambia a "Ejecutando... Detener", y cada nodo muestra su estado.</em></p>

Cuando el workflow comienza, el botón superior cambia a **Ejecutando... Detener**. La entrada de IA en la parte inferior se bloquea para que el blueprint no cambie durante la ejecución.

El lienzo muestra el estado de los nodos directamente. En la captura de pantalla, Inicio ha finalizado, el nodo paralelo aún se está ejecutando, y el contador superior derecho muestra el progreso de la ejecución.

Eso es más legible que un log largo. Si algo falla, no necesitas descartar todo el prompt. Puedes encontrar el nodo que falla y ajustar solo el prompt, el modelo o la entrada de ese nodo.

## 9. Cambia el tema de apariencia

<p align="center">
  <img src="images/9-切换风格.png" alt="Configuración de apariencia con múltiples temas" width="840">
</p>
<p align="center"><em>Figura 9: La función final llega a Configuración / Apariencia, donde puedes elegir Pencil, Deep Night, Aurora, Daylight, Ember y más.</em></p>

El objetivo de este ejemplo es permitir que OpenWorkflows admita múltiples temas de apariencia. El punto de entrada final es **Configuración / Apariencia**.

La captura de pantalla muestra tarjetas de tema como Pencil, Deep Night, Aurora, Daylight y Ember. Cuando eliges uno, cambia el fondo global, los paneles, los bordes y los colores del estado de ejecución.

Eso también muestra el caso de uso real aquí. OpenWorkflows no es solo para diagramas de demostración. Puede desglosar una solicitud de producto en investigación, diseño, implementación, validación y seguimiento de entrega, y luego impulsar cada pieza a través del nodo correcto.

## Lo que creo que realmente es útil

OpenWorkflows es valioso para más que envolver un prompt en una interfaz.

Conecta la solicitud, el blueprint, el script, la ejecución y la revisión del historial. Puedes generar un flujo en lenguaje natural, inspeccionar la estructura en el lienzo, usar prompts comunes para ajustar los límites, y solo entonces ejecutarlo.

Un workflow tampoco tiene que estar atado a un solo modelo. Los nodos simples pueden usar modelos más baratos, los nodos importantes pueden usar modelos más potentes, y el objetivo de ejecución puede seguir expandiéndose a Claude Code, Codex, Gemini u otros entornos de ejecución.

Para tareas complejas de programación con IA, esa estructura es mucho más fácil de mantener que un prompt enorme. Si un nodo falla, arregla ese nodo. Si una rama es innecesaria, elimínala. Si quieres reutilizarlo, continúa desde el historial.

## Cómo se relaciona con Claude Code

OpenWorkflows no parece un reemplazo de Claude Code.

Claude Code ya dejó clara la dirección del workflow: el trabajo complejo puede escribirse como scripts dinámicos, coordinarse entre múltiples subagentes y ejecutarse en segundo plano.

OpenWorkflows añade una capa visual a esa dirección: dibuja el workflow, edítalo, guárdalo, y luego prueba la misma estructura con más modelos y entornos de ejecución.

Así que no va en contra de Claude Code. Está extendiendo la idea de workflow hacia afuera.

## Aún es temprano, pero vale la pena seguirlo

OpenWorkflows aún no es maduro. Los adaptadores de runtime, las capacidades de los nodos y el ecosistema de scripts seguirán cambiando.

Pero la dirección es clara. La programación con IA no se quedará para siempre en "abrir un cuadro de chat y empujar manualmente cada paso".

Eventualmente, las tareas complejas se convertirán en workflows. La única pregunta real es si ese workflow permanecerá encerrado dentro de una herramienta, o si podrá verse, editarse, migrarse y reutilizarse.

Proyecto:

https://github.com/wellingfeng/OpenWorkflows

Referencia:

https://code.claude.com/docs/en/workflows
