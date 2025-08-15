<template>
  <el-dialog
    v-model="playerData.openDefectConfirm"
    title="确认缺陷"
    width="800px"
    :align-center="true"
    :before-close="handleClose"
    draggable
    :modal="true"
  >
    <el-form ref="form" :model="formData" label-width="120px" :rules="rules" label-position="right">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="线路名称：" prop="lineId">
            <el-select disabled="disabled" v-model="formData.lineId" placeholder="请选择" :append-to="fullScreenElement">
              <el-option v-for="item in lineNameList" :key="item.id" :value="item.id" :label="item.lineName"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="线路行别：" prop="lineDirection">
            <el-select disabled="disabled" v-model="formData.lineDirection" placeholder="请选择" :append-to="fullScreenElement">
              <el-option v-for="item in lineTypeList" :key="item.dictValue" :value="item.dictValue" :label="item.dictLabel"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所在区站：" prop="stationId">
            <el-select v-model="formData.stationId" placeholder="请选择" :append-to="fullScreenElement">
              <el-option v-for="item in allStationList" :key="item.id" :value="item.id" :label="item.stationName"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="支柱杆号：" prop="pillarNum">
            <el-input v-model="formData.pillarNum" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="公里标：" prop="km">
            <el-input v-model="formData.km" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责车间：" prop="deptId">
            <el-cascader :append-to="fullScreenElement" placeholder="请选择" v-model="formData.deptId" :options="deptList" clearable style="width: 100%;"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="缺陷类型：" prop="defectType">
            <!-- <el-input v-model="formData.defectType" placeholder="请输入" /> -->
            <el-select
              v-model="formData.defectType"
              filterable
              allow-create
              default-first-option
              :reserve-keyword="false"
              placeholder="请输入"
              style="width: 100%"
              :append-to="fullScreenElement"
            >
              <el-option
                v-for="item in defectTypeList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="缺陷等级：" prop="levels">
            <el-select v-model="formData.levels" placeholder="请选择" :append-to="fullScreenElement">
              <el-option
                v-for="item in levelList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="缺陷部位：" prop="defectLocation">
            <el-input v-model="formData.defectLocation" type="textarea" :rows="2" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="缺陷描述：" prop="defectDesc">
            <el-input v-model="formData.defectDesc" type="textarea" :rows="2" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="额外参数：" prop="extraParam">
            <el-input v-model="formData.extraParam" type="textarea" :rows="2" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="备注信息：" prop="remark">
            <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="请输入" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { playerDataStore } from '../hooks'

// 全局数据
const playerData = playerDataStore()

// 表单数据
interface DefectFormData {
  lineId: string
  lineDirection: string
  stationId: string
  pillarNum: string
  km: string
  deptId: string
  defectType: string
  levels: string
  defectLocation: string
  defectDesc: string
  extraParam: string
  remark: string

  filePath?: string
  file?: string
  frameNumber?: number
  id?: number
  deptName?: string
}

const form = ref()
const loading = ref(false)
const initData = {
  lineId: '',
  lineDirection: '',
  stationId: '',
  pillarNum: '',
  km: '',
  deptId: '',
  defectType: '',
  levels: '',
  defectLocation: '',
  defectDesc: '',
  extraParam: '',
  remark: '',
}
const formData = ref<DefectFormData>({
  ...initData
})

// 表单校验规则（可根据实际需求扩展）
const rules = {
  lineId: [{ required: true, message: '请选择线路名称', trigger: 'change' }],
  lineDirection: [{ required: true, message: '请选择线路行别', trigger: 'change' }],
  stationId: [{ required: true, message: '请选择所在区站', trigger: 'change' }],
  pillarNum: [{ required: true, message: '请输入支柱杆号', trigger: 'blur' }],
  // km: [{ required: true, message: '请输入公里标', trigger: 'blur' }],
  // deptId: [{ required: true, message: '请选择负责车间', trigger: 'change' }],
  defectType: [{ required: true, message: '请选择缺陷类型', trigger: 'blur' }],
  levels: [{ required: true, message: '请选择缺陷等级', trigger: 'change' }],
  defectDesc: [{ required: true, message: '请输入缺陷描述', trigger: 'blur' }],
}

// 获取线路
const lineNameList = ref<any[]>([
  {
    id: 1,
    lineName: '成渝线',
  },
  {
    id: 2,
    lineName: '成昆线',
  },
  {
    id: 3,
    lineName: '成贵线',
  }
])

// 获取行别
const lineTypeList = ref<any[]>([
  {
    dictValue: 0,
    dictLabel: '上行',
  },
  {
    dictValue: 1,
    dictLabel: '下行',
  },
])

// 获取开始/结束区站
const allStationList = ref<any[]>([
  {
    id: '1',
    stationName: '成都站',
  },
  {
    id: '2',
    stationName: '双流站',
  },
  {
    id: '3',
    stationName: '都江堰站',
  },
  {
    id: '4',
    stationName: '青城山站',
  }
])

// 获取车间列表
const deptList: any = ref<any[]>([
  {
    value: '1',
    label: '双流车间',
    children: [
      {
        value: '1-1',
        label: '双流一车间',
      },
      {
        value: '1-2',
        label: '双流二车间',
      }
    ]
  },
  {
    value: '2',
    label: '成华车间',
    children: [
      {
        value: '2-1',
        label: '成华一车间',
      },
      {
        value: '2-2',
        label: '成华二车间',
      }
    ]
  }
])

// 获取缺陷等级
const levelList = ref<any[]>([
  {
    value: '0',
    label: '一级',
  },
  {
    value: '1',
    label: '二级',
  },
  {
    value: '2',
    label: '三级',
  },
  {
    value: '3',
    label: '四级',
  }
])

// 获取缺陷类型列表
const defectTypeList = ref<string[]>([
  '上跨桥',
  '隧道',
  '道岔',
  '轨道',
  '电力设备',
  '通信设备',
  '其他'
])

const fullScreenElement = document.querySelector('#vcplayer-fullscreen')

// 监听 visible 变化
watch(
  () => playerData.openDefectConfirm,
  (newVal) => {
    if (newVal) {
      form.value?.resetFields() // 重置表单
      const taskData = playerData.taskData
      form.value?.resetFields() // 重置表单
      formData.value = {
        ...initData,
        ...playerData.defectData,
        lineId: taskData.lineId,
        lineDirection: taskData.lineDirection,
      }
    }
  },
)


// 提交表单
const handleSubmit = () => {
  if (loading.value) return // 防止重复提交
  form.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        playerData.defectPosList.push({
          ...formData.value,
          "deptName": "双流车间",
          "taskId": playerData.taskData.id,
          "fileId": playerData.fileList[playerData.selectedFileIndex].fileId,
          "file": "",
          "frameNumber": window.vcplayer?.getCurrentFrame?.()
        })
        handleClose()
      } catch (error) {
        loading.value = false
      }
    } else {
    }
  })
}

// 关闭弹窗
const handleClose = () => {
  playerData.openDefectConfirm = false
}
</script>

<style scoped lang="scss">
.dialog-footer {
  text-align: right;
}
</style>