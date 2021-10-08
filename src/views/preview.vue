<template>
  <div class="preview flex-col flex-grow">
    <status />
    <section class="flex-row flex-grow">
      <graph :readonly="true" :progress="progress"></graph>
    </section>
  </div>
</template>

<script>
import status from "../components/status";
import Graph from "../components/Graph";
import service from "../common/service";
import metadata from "../common/metadata";
import { parser } from "../plugin/xml";
export default {
  name: "Preview",
  props: ["params"],
  components: { status, Graph },
  data() {
    return {
      progress: null
    };
  },
  created() {
    let modelId = this.params.modelId;
    let instanceId = this.params.instanceId;
    let modelKey = this.params.modelKey;
    if (modelId) {
      service.queryById(modelId).then(({ data }) => {
        parser.xml2Meta(data.xml);
        metadata.getData().workflow.modelId = modelId;
      });
    } else if (instanceId) {
      service.queryByInstanceId(instanceId).then(({ data }) => {
        parser.xml2Meta(data.xml);
        this.progress = { ...data }
      });
    } else if (modelKey) {
      service.querymodelbykey(modelKey).then(({ data }) => {
        parser.xml2Meta(data.xml);
        metadata.getData().modelId = data.modelId;
      });
    }
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
.header-title {
  line-height: 50px;
  font-size: 16px;
  color: #666;
  font-weight: bold;
}
.preview {
  padding: 20px;
}
</style>