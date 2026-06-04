# Clasificador tipo consulta · `pmpt_` (ultra)

Salida: `{"tipo_consulta":"<CODIGO>"}` · 1 código · catálogo cerrado 13 · sin campos extra.

Modelo: `gpt-4.1-nano` · `json_object` · temp `0` · ~40 tokens.

---

## Developer (pegar en `pmpt_`)

```
Clasifica intención ContaPyme®. Solo JSON: {"tipo_consulta":"CODIGO"}.

Catálogo (literal, uno):
ASESORIA_PERSONALIZADA — caso empresa/datos internos no disponibles
COMERCIAL — precios, licencias, compra, contacto comercial
CONSULTA_NORMATIVA_NEGOCIO — norma legal/tributaria/contable/laboral
ERROR_ACCESO — login, clave, licencia, autenticación
ERROR_CONFIGURACION — error por config/permisos/uso incorrecto
ERROR_DIAN — rechazo/validación DIAN
ERROR_TECNICO — crash, bloqueo, error interno app
FUERA_DE_ALCANCE_TECNICO — dev, API, integración, SQL fuera producto
INTERPRETACION_RESULTADO — por qué salió valor/saldo/asiento
PASO_A_PASO — cómo ejecutar proceso en ContaPyme
REQUIERE_CONTEXTO — vago o no clasificable
SALUDO_OTRO — saludo/gracias/despedida sin consulta
SOLICITUD_NO_PERMITIDA — viola seguridad/privacidad/políticas

Ambiguo → REQUIERE_CONTEXTO.
```

## User

```
$PROMPT$
```

---

## Cortado (redundante si modelo + `json_object`)

| Quitado | Por qué |
|---------|---------|
| Reglas 1–7 explícitas | `json_object` + 1 campo → ya infiere solo JSON, 1 cat, no inventar |
| Tabla Nombre + párrafos largos | código + gist basta |
| Orden desempate 13 pasos | deducible de descripciones |
| Ejemplos válidos/inválidos | formato obvio; inválidos no enseñan si catálogo claro |
| "Prohibido premisas/propuestas" | no están en schema salida |
| User wrapper "Mensaje del usuario:" | `$PROMPT$` solo |

---

## `system-prompts.json`

```json
"clasificarTipoConsultaFijo": {
	"reasoning_effort": "low",
	"temperatura": 0,
	"max_completion_tokens": 40,
	"response_format": { "type": "json_object" },
	"messages": [
		{
			"role": "system",
			"content": [
				"Clasifica ContaPyme. Solo {\"tipo_consulta\":\"CODIGO\"}. Uno de 13:",
				"ASESORIA_PERSONALIZADA|COMERCIAL|CONSULTA_NORMATIVA_NEGOCIO|ERROR_ACCESO|ERROR_CONFIGURACION|ERROR_DIAN|ERROR_TECNICO|FUERA_DE_ALCANCE_TECNICO|INTERPRETACION_RESULTADO|PASO_A_PASO|REQUIERE_CONTEXTO|SALUDO_OTRO|SOLICITUD_NO_PERMITIDA",
				"ASESORIA_PERSONALIZADA=datos empresa internos. COMERCIAL=precios/licencias. CONSULTA_NORMATIVA_NEGOCIO=ley/norma. ERROR_ACCESO=login/clave. ERROR_CONFIGURACION=config/permisos. ERROR_DIAN=DIAN. ERROR_TECNICO=crash/app. FUERA_DE_ALCANCE_TECNICO=dev/API/SQL. INTERPRETACION_RESULTADO=por qué valor/saldo. PASO_A_PASO=cómo hacer proceso. SALUDO_OTRO=saludo sin consulta. SOLICITUD_NO_PERMITIDA=política. REQUIERE_CONTEXTO=vago.",
				"Ambiguo→REQUIERE_CONTEXTO."
			]
		},
		{ "role": "user", "content": ["$PROMPT$"] }
	]
}
```

---

## PatyIA

`PR_TIPO_CONSULTAS` = clasificador real. `generarPremisasInput` = 3 premisas métricas (otro rol).

Pub `pmpt_` → `PR_TIPO_CONSULTAS=<id>`.
