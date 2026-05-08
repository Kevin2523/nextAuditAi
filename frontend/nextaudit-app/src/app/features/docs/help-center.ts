import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface HelpCategory {
  title: string;
  desc: string;
  article: string;
}

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-center.html',
})
export class HelpCenter {
  readonly query = signal('');
  readonly selectedTitle = signal('Primeros Pasos');

  readonly categories: HelpCategory[] = [
    {
      title: 'Primeros Pasos',
      desc: 'Sincronizacion en la nube y configuracion de tu primer laboratorio.',
      article:
        'Conecta Fleet desde la consola de acceso, valida que el token quede activo y revisa el inventario. La pantalla no rellena hosts de ejemplo: si Fleet no responde, veras el estado offline.',
    },
    {
      title: 'Motor de Autosanacion',
      desc: 'Como funciona la tecnologia de analisis para auto-reparar la flota.',
      article:
        'Las acciones de remediacion deben nacer de ejecuciones reales en n8n. NextAudit muestra esas ejecuciones en Registro de Actividad y evita botones de reparacion cuando no existe un flujo conectado.',
    },
    {
      title: 'Auditorias y Reportes',
      desc: 'Interpretar las puntuaciones de riesgo y descargables.',
      article:
        'El reporte operativo se genera con hosts reales de Fleet, vulnerabilidades activas y ejecuciones reales de n8n. Si una fuente esta offline, el reporte lo refleja con los datos disponibles.',
    },
    {
      title: 'Alertas Criticas',
      desc: 'Gestion y clasificacion de notificaciones en tiempo real.',
      article:
        'Las alertas provienen de vulnerabilidades y ejecuciones fallidas. Usa Inventario para revisar hosts en riesgo y Registro de Actividad para seguir la linea de tiempo.',
    },
  ];

  readonly filteredCategories = computed(() => {
    const text = this.query().trim().toLowerCase();
    if (!text) return this.categories;

    return this.categories.filter(
      (cat) =>
        cat.title.toLowerCase().includes(text) ||
        cat.desc.toLowerCase().includes(text) ||
        cat.article.toLowerCase().includes(text),
    );
  });

  readonly selectedCategory = computed(
    () => this.categories.find((cat) => cat.title === this.selectedTitle()) ?? this.categories[0],
  );

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value || '');
  }

  selectCategory(category: HelpCategory) {
    this.selectedTitle.set(category.title);
  }
}
