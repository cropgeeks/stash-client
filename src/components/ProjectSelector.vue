<template>
  <div>
    <b-form-group :label="$t('formLabelImportProject')" :description="$t('formDescriptionImportProject')" label-for="project">
      <b-input-group>
        <b-form-select :options="projects" v-model="selectedProject" id="project" />
        <b-input-group-addon>
          <b-button @click="$refs.addProjectModal.show()"><BIconPlusSquare /></b-button>
        </b-input-group-addon>
      </b-input-group>
    </b-form-group>
    <AddProjectModal ref="addProjectModal" @project-added="getProjects" />
  </div>
</template>

<script>
import AddProjectModal from '@/components/modals/AddProjectModal'
import { apiPostProjectTable } from '@/plugins/api/project'
import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
import { BIconPlusSquare } from 'bootstrap-vue'

export default {
  components: {
    AddProjectModal,
    BIconPlusSquare
  },
  data: function () {
    return {
      projects: [],
      selectedProject: null
    }
  },
  watch: {
    selectedProject: function (newValue) {
      this.$emit('project-selected', newValue)
    }
  },
  methods: {
    selectProject: function (projectId) {
      if (this.projects) {
        const match = this.projects.find(p => p.value.id === projectId)

        if (match) {
          this.selectedProject = match.value
        }
      }
    },
    getProjects: function (newProject) {
      apiPostProjectTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
        sortBy: 'name',
        ascending: 1
      }, result => {
        if (result && result.data) {
          this.projects = result.data.map(p => {
            let name = p.name

            if (p.startDate || p.endDate) {
              const dates = [p.startDate, p.endDate].map(d => d ? new Date(d).toLocaleDateString() : 'N/A')

              name += ` (${dates.join(' - ')})`
            }

            return {
              text: name,
              value: p
            }
          })

          if (result.data.length > 0) {
            if (newProject) {
              this.selectedProject = result.data.find(p => p.id === newProject.id)
            } else {
              this.selectedProject = result.data[0]
            }
          } else {
            this.selectedProject = null
          }
        } else {
          this.projects = []
          this.selectedProject = null
        }
      })
    }
  },
  mounted: function () {
    this.getProjects()
  }
}
</script>

<style>

</style>
